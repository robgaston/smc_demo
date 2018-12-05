import "./styles.css";
import "mapbox-gl/dist/mapbox-gl.css";
import * as mapboxgl from "mapbox-gl";
import settings from "./settings.json";

const popup = document.querySelector("#popup");
let hovered;
let map;

async function init() {
    const custom = await import("./custom-style.json");
    const unified = await import("../data/unified.json");
    const style = map.getStyle();

    style.sources = {
        ...style.sources,
        ...custom.sources
    };
    style.layers.push(...custom.layers);
    map.setStyle(style);

    unified.features.forEach((feature) => {
        feature.id = feature.properties.ID1;
    });
    map.getSource("unified").setData(unified);

    initPopup();
    initLegend();
}

function initPopup() {
    const districtName = popup.querySelector(".district-name");
    const count = popup.querySelector(".count");

    map.on("mousemove", "unified", (e) => {
        clearHover();
        if (e.features.length > 0) {
            hovered = e.features[0];
            map.setFeatureState(hovered, { hover: true });
            popup.style.display = "block";
            districtName.textContent = hovered.properties.Name;
        }
    });

    map.on("mouseleave", "unified", clearHover);
}

function clearHover() {
    if (hovered) {
        map.setFeatureState(hovered, { hover: false });
    }
    popup.style.display = "none";
    hovered = null;
}

async function initLegend() {
    document.querySelectorAll('input[name="district"]').forEach((input) => {
        input.addEventListener("change", async function(e) {
            const data = await import(`../data/${e.target.value}.json`);
            data.features.forEach((feature) => {
                feature.id = feature.properties.ID1;
            });
            map.getSource("unified").setData(data);
        });
    });
}

mapboxgl.accessToken = settings.accessToken;
map = new mapboxgl.Map(settings);
map.on("load", init);
