import { test, expect } from "@playwright/test";
import { defaultLayout } from "../src/launcher/layout";
test("published full test preview has four dock apps and the updated status bar", async ({
  page,
  request,
}) => {
  const work = await (await request.get("/test-work.json")).json();
  expect(work.id).toBe("ui-test-phone-v2");
  expect(
    work.apps.filter((a: { installed: boolean }) => a.installed),
  ).toHaveLength(49);
  expect(work.nodes).toHaveLength(0);
  expect(
    work.apps.filter(
      (a: { installed: boolean; dock: boolean }) => a.installed && a.dock,
    ),
  ).toHaveLength(4);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/?preview=test");
  await page.getByRole("button", { name: "轻触解锁" }).waitFor();
  await page
    .locator(".phone-screen")
    .screenshot({ path: "docs/images/lock.png" });
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await expect(page.locator(".lock-screen")).toHaveCount(0);
  await expect(page.locator(".interactive-home")).toHaveCSS("opacity", "1");
  await expect(page.locator(".dock [data-home-key]")).toHaveCount(4);
  await expect(page.locator(".status-silent")).toBeVisible();
  await expect(page.locator(".status-cellular")).toBeVisible();
  await expect(page.locator(".status-wifi")).toBeVisible();
  await page
    .locator(".phone-screen")
    .screenshot({ path: "docs/images/home.png" });
  await page
    .locator(".status-bar")
    .screenshot({ path: "outputs/release/status-bar.png" });
  await page
    .getByRole("button", { name: "打开App Store", exact: true })
    .click();
  await page.getByPlaceholder("搜索全部App").fill("X");
  const x = page.locator(".runtime-library-row").filter({
    has: page.locator(".library-app-title strong", { hasText: /^X$/ }),
  });
  await expect(x.locator("[data-original-icon=twitter] img")).toHaveAttribute(
    "src",
    /twitter\.svg$/,
  );
  await x.getByRole("button", { name: "打开", exact: true }).click();
  await expect(page.locator(".app-screen:not([inert])")).toHaveCSS(
    "transform",
    "none",
  );
  await page.getByRole("button", { name: "返回桌面", exact: true }).click();
  await page
    .getByRole("button", { name: "打开App Store", exact: true })
    .click();
  await page.getByPlaceholder("搜索全部App").fill("设置");
  await page
    .locator(".runtime-library-row")
    .getByRole("button", { name: "打开", exact: true })
    .click();
  await expect(page.getByRole("switch", { name: "飞行模式" })).toBeVisible();
  await expect(page.locator(".app-screen:not([inert])")).toHaveCSS(
    "transform",
    "none",
  );
  await page
    .locator(".phone-screen")
    .screenshot({ path: "docs/images/settings.png" });
  await page.reload();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await expect(page.locator(".dock [data-home-key]")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("story contacts match in both apps and removed apps stay out of old layouts", async ({
  page,
  request,
}) => {
  const removed = ["twitter", "wallet", "health", "find", "calculator", "mail"];
  const work = await (await request.get("/work.json")).json();
  const preview = await (await request.get("/test-work.json")).json();
  const layout = defaultLayout(work);
  Reflect.deleteProperty(layout, "authorApps");
  for (const id of removed) {
    const app = preview.apps.find((entry: { id: string }) => entry.id === id);
    layout.apps.push(app);
    layout.order.push(id);
    layout.positions[id] = { page: 0, x: 3, y: 4 };
    expect(work.data[id]).toBeUndefined();
  }
  layout.widgets.push({ id: "widget-keep", type: "battery", size: "small" });

  const key = "foundphone-layout-v1:" + work.id;
  await page.addInitScript(
    ({ key, layout }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(layout));
    },
    { key, layout },
  );
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.getByRole("button", { name: "轻触解锁" }).click();
  for (const digit of work.phone.passcode)
    await page
      .getByRole("button", { name: "密码键" + digit, exact: true })
      .click();
  await expect(page.locator('[data-home-key="widget-keep"]')).toBeVisible();
  for (const id of removed)
    await expect(page.locator(`[data-app-id="${id}"]`)).toHaveCount(0);

  await page
    .getByRole("button", { name: "打开App Store", exact: true })
    .click();
  for (const id of removed)
    await expect(
      page.locator(`.runtime-library-row [data-original-icon="${id}"]`),
    ).toHaveCount(0);
  await page.getByRole("button", { name: "关闭App管理" }).click();
  await page.getByRole("button", { name: "打开通讯录", exact: true }).click();

  const list = page.locator(".native-contacts");
  const detail = page.locator(".native-detail-contacts");
  const cards = [
    [
      list.getByRole("button", { name: /我的名片/ }),
      "Hamza Abdelkarim",
      "HA",
      "001",
    ],
    [list.getByRole("button", { name: /Xavi/ }), "Xavi", "X", "002"],
    [
      list.getByRole("button", { name: /Marc Bernal/ }),
      "Marc Bernal",
      "MB",
      "003",
    ],
    [
      list.getByRole("button", { name: /Pablo Gavi/ }),
      "Pablo Gavi",
      "PG",
      "004",
    ],
    [list.getByRole("button", { name: /Pedri/ }), "Pedri", "P", "005"],
    [
      list.getByRole("button", { name: /Lamine Yamal/ }),
      "Lamine Yamal",
      "LY",
      "006",
    ],
  ] as const;
  for (const [row, name, initials, number] of cards) {
    const avatar = row.locator(".contact-initials");
    await expect(avatar).toHaveText(initials);
    await expect(avatar).toHaveCSS("border-radius", "50%");
    const bounds = await avatar.boundingBox();
    expect(bounds?.width).toBe(bounds?.height);
    await row.click();
    await expect(
      detail.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(detail.locator(".contact-initials")).toHaveText(initials);
    await expect(detail.locator(".contact-initials")).toHaveCSS(
      "border-radius",
      "50%",
    );
    await expect(detail.getByText("+34 790 010 " + number)).toBeVisible();
    await detail.getByRole("button", { name: "返回", exact: true }).click();
  }

  const names = await list.locator(".catalog-row strong").allTextContents();
  await page.getByRole("button", { name: "返回桌面", exact: true }).click();
  await page.getByRole("button", { name: "打开电话", exact: true }).click();
  const phone = page.locator(".native-phone");
  await expect(phone.getByRole("heading", { name: "最近通话" })).toBeVisible();
  await phone.getByRole("button", { name: "通讯录", exact: true }).click();
  await expect(phone.locator(".catalog-row strong")).toHaveText(names);
  await expect(phone.locator(".contact-self strong")).toHaveText(
    "Hamza Abdelkarim",
  );
  await phone.getByRole("textbox", { name: "搜索" }).fill("790 010 005");
  await expect(phone.locator(".catalog-row strong")).toHaveText(["Pedri"]);
  await phone.getByRole("button", { name: /Pedri/ }).click();
  await expect(detail.locator(".contact-initials")).toHaveText("P");
  await expect(detail.getByText("+34 790 010 005")).toBeVisible();
  await detail.getByRole("button", { name: "返回", exact: true }).click();
  await phone.getByRole("button", { name: "最近通话", exact: true }).click();
  await expect(phone.getByRole("heading", { name: "最近通话" })).toBeVisible();
});

test("world clock uses the story's Beijing time and each city's seasonal offset", async ({
  page,
  request,
}) => {
  const work = await (await request.get("/work.json")).json();
  for (const [date, times] of [
    ["2026-12-25", ["09:41", "02:41", "03:41"]],
    ["2026-07-01", ["09:41", "03:41", "04:41"]],
  ] as const) {
    await page.route(
      "**/work.json",
      (route) =>
        route.fulfill({
          json: {
            ...work,
            id: work.id + date,
            phone: { ...work.phone, date, time: "09:41" },
          },
        }),
      { times: 1 },
    );
    await page.goto("/");
    await page.getByRole("button", { name: "轻触解锁" }).click();
    for (const digit of work.phone.passcode)
      await page
        .getByRole("button", { name: "密码键" + digit, exact: true })
        .click();
    await page.getByRole("button", { name: "打开时钟", exact: true }).click();
    const clock = page.locator(".native-clock");
    await expect(
      clock.getByRole("heading", { name: "世界时钟" }),
    ).toBeVisible();
    await expect(clock.locator(".alarm-row small")).toHaveText([
      "S城",
      "巴塞罗那",
      "开罗",
    ]);
    await expect(clock.locator(".alarm-row time")).toHaveText([...times]);
    await clock.getByRole("button", { name: "闹钟", exact: true }).click();
    await expect(clock.getByText("暂无闹钟")).toBeVisible();
    await expect(clock.getByRole("switch")).toHaveCount(0);
  }
});
