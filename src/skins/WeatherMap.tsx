import { useState } from "react";
import { Map } from "lucide-react";
import { z } from "zod";
import type { Item } from "../schema";
import terrain from "./zhengzhou-weather-map.png";
import { meta } from "./shared";

const layers = [
  { key: "temperature", name: "气温", unit: "°" },
  { key: "rain", name: "降水概率", unit: "%" },
  { key: "aqi", name: "空气质量", unit: "" },
] as const;

// Geographic bounds of the local Natural Earth basemap.
const bounds = { west: 113.17, east: 114.2, south: 34.19, north: 35.12 };
const nearbySchema = z
  .array(
    z.object({
      name: z.string().trim().min(1).max(12),
      longitude: z.number().min(bounds.west).max(bounds.east),
      latitude: z.number().min(bounds.south).max(bounds.north),
      temperature: z.number(),
      rain: z.number().min(0).max(100),
      aqi: z.number().int().min(1).max(500),
    }),
  )
  .max(6);

function nearbyPlaces(item: Item) {
  try {
    const result = nearbySchema.safeParse(
      JSON.parse(meta(item, "mapPlaces", "[]")),
    );
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function WeatherMap({ item }: { item?: Item }) {
  const [layer, setLayer] =
    useState<(typeof layers)[number]["key"]>("temperature");
  const [selected, setSelected] = useState<string>();
  if (!item || meta(item, "mapRegion") !== "zhengzhou") {
    return (
      <div className="weather-map-empty">
        <Map size={60} />
        <p>暂无地图数据</p>
      </div>
    );
  }
  const places = [
    {
      name: item.title,
      longitude: 113.625,
      latitude: 34.747,
      temperature: meta(item, "temperature") || "—",
      rain: meta(item, "rain").replace(/%$/, "") || "—",
      aqi: meta(item, "aqi") || "—",
    },
    ...nearbyPlaces(item),
  ];
  const active = places.find((place) => place.name === selected) ?? places[0];
  const { name: label, unit } = layers.find((option) => option.key === layer)!;

  return (
    <section className="weather-region" data-layer={layer}>
      <div className="weather-map-layers" role="group" aria-label="天气图层">
        {layers.map((option) => (
          <button
            type="button"
            key={option.key}
            aria-pressed={layer === option.key}
            onClick={() => setLayer(option.key)}
          >
            {option.name}
          </button>
        ))}
      </div>
      <div className="weather-map-stage" role="group" aria-label="郑州周边地图">
        <img src={terrain} alt="" />
        <span className="weather-map-river" aria-hidden="true">
          黄河
        </span>
        {places.map((place) => (
          <button
            type="button"
            key={place.name}
            className="weather-map-pin"
            aria-label={`${place.name} ${label} ${place[layer]}${unit}`}
            aria-pressed={place === active}
            style={{
              left: `${((place.longitude - bounds.west) / (bounds.east - bounds.west)) * 100}%`,
              top: `${((bounds.north - place.latitude) / (bounds.north - bounds.south)) * 100}%`,
            }}
            onClick={() => setSelected(place.name)}
          >
            <span>
              {place[layer]}
              {unit}
            </span>
            <strong>{place.name}</strong>
          </button>
        ))}
      </div>
      <div className="weather-map-reading" aria-live="polite">
        <div>
          <small>{label === "空气质量" ? "空气质量指数 (AQI)" : label}</small>
          <strong>{active.name}</strong>
        </div>
        <output>
          {active[layer]}
          {layer === "temperature" ? "°C" : unit}
        </output>
      </div>
      <small className="weather-map-credit">
        剧情天气 · 底图数据 Natural Earth
      </small>
    </section>
  );
}
