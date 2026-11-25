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
  await page.setViewportSize({ width: 393, height: 659 });
  const work = await (await request.get("/work.json")).json();
  for (const [date, time, times, offsets] of [
    [
      "2026-12-25",
      "09:41",
      ["09:41", "02:41", "03:41"],
      ["今天 +0小时", "今天 -7小时", "今天 -6小时"],
    ],
    [
      "2026-07-01",
      "09:41",
      ["09:41", "03:41", "04:41"],
      ["今天 +0小时", "今天 -6小时", "今天 -5小时"],
    ],
    [
      "2026-12-25",
      "00:30",
      ["00:30", "17:30", "18:30"],
      ["今天 +0小时", "昨天 -7小时", "昨天 -6小时"],
    ],
  ] as const) {
    await page.route(
      "**/work.json",
      (route) =>
        route.fulfill({
          json: {
            ...work,
            id: work.id + date + time,
            phone: { ...work.phone, date, time },
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
    await expect(clock.locator(".world-clock-city")).toHaveText([
      "S城",
      "巴塞罗那",
      "开罗",
    ]);
    await expect(clock.locator(".world-clock-row time")).toHaveText([...times]);
    await expect(clock.locator(".world-clock-row small")).toHaveText([
      ...offsets,
    ]);
    await clock.getByRole("button", { name: "闹钟", exact: true }).click();
    await expect(clock.getByText("暂无闹钟")).toBeVisible();
    await expect(clock.getByRole("switch")).toHaveCount(0);
  }
});

test("the story clock advances with the player open", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.clock.install();
  await page.goto("/");
  const status = page.locator(".status-bar");
  await expect(status.locator(".status-time")).toContainText("09:41");
  await page.clock.runFor(61_000);
  await expect(status.locator(".status-time")).toContainText("09:42");
});

test("the school phone starts on 4G with two SIMs and nearby Wi-Fi", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  const status = page.locator(".status-bar");
  await expect(status.locator(".status-network-type")).toHaveText("4G");
  await expect(status.locator(".status-wifi")).toHaveCount(0);
  await page.getByRole("button", { name: "轻触解锁" }).click();
  for (const digit of "0101")
    await page
      .getByRole("button", { name: "密码键" + digit, exact: true })
      .click();
  await expect(page.locator(".lock-screen")).toHaveCount(0);
  await page.getByRole("button", { name: "控制中心", exact: true }).click();
  const center = page.locator(".device-control");
  await expect(center.locator(".cc-status")).toContainText("中国移动");
  await expect(center.locator(".cc-status")).toContainText("Vodafone Egypt");
  await expect(
    center.getByRole("button", { name: "蜂窝数据" }),
  ).toHaveAttribute("aria-pressed", "true");
  await center.getByRole("button", { name: "网络连接" }).click();
  const wifi = center.locator(".cc-tool");
  await expect(wifi.getByText("未连接")).toBeVisible();
  await expect(wifi.locator(".cc-wifi-list button")).toHaveText([
    "S城一高",
    "S城一高_图书馆",
    "闹麻麻小卖部",
  ]);
  await wifi.getByRole("button", { name: "完成" }).click();
  await center.getByRole("button", { name: "关闭控制中心" }).click();
  await page.getByRole("button", { name: "打开设置", exact: true }).click();
  const settings = page.locator(".native-settings");
  await settings.getByRole("button", { name: /无线局域网/ }).click();
  for (const [width, height] of [
    [393, 852],
    [1280, 900],
  ]) {
    await page.setViewportSize({ width, height });
    const heading = settings.getByText("其他网络", { exact: true });
    const list = settings.locator(".settings-wifi-networks");
    const switchTrack = settings.locator(".ios-toggle");
    const switchRow = settings.locator(".settings-native-row").filter({
      has: page.getByRole("switch", { name: "Wi-Fi", exact: true }),
    });
    await expect(heading).toBeVisible();
    await expect
      .poll(async () => {
        const label = (await heading.boundingBox())!;
        const card = (await list.boundingBox())!;
        return card.y - (label.y + label.height);
      })
      .toBeGreaterThan(4);
    await expect
      .poll(async () => {
        const toggle = (await switchTrack.boundingBox())!;
        const row = (await switchRow.boundingBox())!;
        return row.x + row.width - toggle.x - toggle.width;
      })
      .toBeLessThan(20);
  }
  await settings
    .getByRole("button", { name: "S城一高_图书馆", exact: true })
    .click();
  const prompt = page.getByRole("dialog", {
    name: "S城一高_图书馆 · Wi-Fi 密码",
  });
  await prompt.getByLabel("Wi-Fi 密码").fill("incorrect");
  await prompt.getByRole("button", { name: "加入", exact: true }).click();
  await expect(prompt.getByRole("alert")).toHaveText("密码不正确");
  await expect(prompt.getByLabel("Wi-Fi 密码")).toHaveValue("");
  await expect(status.locator(".status-network-type")).toHaveText("4G");
  await prompt.getByLabel("Wi-Fi 密码").fill("PretendingToStudy");
  await prompt.getByRole("button", { name: "加入", exact: true }).click();
  await expect(settings.getByText("正在加入…", { exact: true })).toBeVisible();
  await expect(status.locator(".status-wifi")).toBeVisible();
  const connectedHeading = settings.getByText("我的网络", { exact: true });
  await expect(connectedHeading).toBeVisible();
  const connectedCard = connectedHeading.locator(
    "xpath=following-sibling::div[1]",
  );
  const labelBounds = (await connectedHeading.boundingBox())!;
  const cardBounds = (await connectedCard.boundingBox())!;
  expect(cardBounds.y - labelBounds.y - labelBounds.height).toBeGreaterThan(4);
  await settings.getByRole("switch", { name: "Wi-Fi" }).uncheck();
  await expect(status.locator(".status-network-type")).toHaveText("4G");
});

test("the locked school Wi-Fi remembers its password and resets teacher attempts at local midnight", async ({
  page,
}) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 393, height: 659 });
  await page.clock.setFixedTime(new Date("2026-12-25T15:59:00Z"));
  const settings = page.locator(".native-settings");
  const school = settings.getByRole("button", { name: "S城一高", exact: true });
  const portal = page.getByRole("dialog", { name: "请认证教师身份" });
  const status = page.locator(".status-bar");

  async function showNetworks(checkKeypad = false) {
    await page.getByRole("button", { name: "轻触解锁" }).click();
    if (checkKeypad) {
      await expect(page.locator(".passcode-dots > i")).toHaveCount(4);
      const keys = page.locator(".pin-digit");
      await expect(keys.locator("small")).toHaveText([
        "ABC",
        "DEF",
        "GHI",
        "JKL",
        "MNO",
        "PQRS",
        "TUV",
        "WXYZ",
      ]);
      const baseline = await keys.evaluateAll((buttons) =>
        buttons
          .slice(0, 3)
          .map(
            (button) => button.querySelector("b")!.getBoundingClientRect().top,
          ),
      );
      expect(Math.max(...baseline) - Math.min(...baseline)).toBeLessThan(1);
      await page.getByRole("button", { name: "紧急情况", exact: true }).click();
      await expect(
        page.getByRole("dialog", { name: "紧急情况" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "返回密码键盘" }).click();
      await expect(
        page.getByRole("button", { name: "取消", exact: true }),
      ).toBeVisible();
    }
    for (const digit of "0101")
      await page
        .getByRole("button", { name: "密码键" + digit, exact: true })
        .click();
    await page.getByRole("button", { name: "打开设置", exact: true }).click();
    await settings.getByRole("button", { name: /无线局域网/ }).click();
  }

  async function fail(remaining: number) {
    await portal.getByLabel("工号", { exact: true }).fill("sample-employee");
    await portal.getByLabel("密码", { exact: true }).fill("sample-credential");
    await portal.getByRole("button", { name: "登录", exact: true }).click();
    const error = page.getByRole("alertdialog", {
      name: "工号不存在或密码错误",
    });
    await expect(error).toBeVisible();
    await error.getByRole("button", { name: "知道了" }).click();
    await expect(
      portal.getByText("最多输入3次，还剩" + remaining + "次机会"),
    ).toBeVisible();
    await expect(status.locator(".status-network-type")).toHaveText("4G");
  }

  await page.goto("/");
  await showNetworks(true);
  await expect(school).toHaveText("S城一高");
  await settings.getByRole("button", { name: "S城一高的网络详情" }).click();
  const info = page.getByRole("dialog", { name: "S城一高 · 网络详情" });
  await expect(info.getByText("需要密码", { exact: true })).toBeVisible();
  await info.getByRole("button", { name: "完成", exact: true }).click();
  await school.click();
  const password = page.getByRole("dialog", { name: "S城一高 · Wi-Fi 密码" });
  await password.getByLabel("Wi-Fi 密码").fill("incorrect");
  await password.getByRole("button", { name: "加入", exact: true }).click();
  await expect(password.getByRole("alert")).toHaveText("密码不正确");
  await password.getByRole("button", { name: "取消", exact: true }).click();
  await expect(school).toHaveText("S城一高");
  await school.click();
  await password.getByLabel("Wi-Fi 密码").fill("OnlyForTeachersHaha");
  await password.getByRole("button", { name: "加入", exact: true }).click();
  await expect(portal.getByText("最多输入3次，还剩3次机会")).toBeVisible();
  await fail(2);
  await portal.getByRole("button", { name: "取消", exact: true }).click();
  await expect(school).toContainText("未加入");
  await school.click();
  await expect(portal.getByText("最多输入3次，还剩2次机会")).toBeVisible();
  await fail(1);
  await page.reload();
  await showNetworks();
  await school.click();
  await expect(portal.getByText("最多输入3次，还剩1次机会")).toBeVisible();
  await expect(school).toContainText("未加入");
  await fail(0);
  await portal.getByLabel("密码", { exact: true }).fill("another-attempt");
  await expect(
    portal.getByRole("button", { name: "登录", exact: true }),
  ).toBeDisabled();
  const save = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((key) =>
      key.startsWith("foundphone-wifi-v1:"),
    );
    return key && localStorage.getItem(key);
  });
  expect(save).not.toContain("sample-employee");
  expect(save).not.toContain("sample-credential");

  await page.clock.setFixedTime(new Date("2026-12-25T16:00:00Z"));
  await portal.getByRole("button", { name: "取消", exact: true }).click();
  await school.click();
  await expect(portal.getByText("最多输入3次，还剩3次机会")).toBeVisible();
  await portal.getByRole("button", { name: "取消", exact: true }).click();
  await expect(school).toContainText("未加入");
  await expect(status.locator(".status-wifi")).toHaveCount(0);

  await page.getByRole("button", { name: "控制中心", exact: true }).click();
  const center = page.locator(".device-control");
  await center.getByRole("button", { name: "网络连接" }).click();
  const shop = center.getByRole("button", {
    name: "闹麻麻小卖部",
    exact: true,
  });
  await shop.click();
  const shopPassword = page.getByRole("dialog", {
    name: "闹麻麻小卖部 · Wi-Fi 密码",
  });
  await shopPassword.getByLabel("Wi-Fi 密码").fill("NoFreeWiFiHere");
  await shopPassword.getByRole("button", { name: "加入", exact: true }).click();
  await expect(shop.getByText("正在加入…")).toBeVisible();
  await expect(shop).toHaveAttribute("aria-pressed", "true");
  await expect(status.locator(".status-wifi")).toHaveCount(1);
});
