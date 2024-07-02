// @ts-check
import { useEffect, useRef } from "preact/hooks";
import { effect } from "@preact/signals";
import { html } from "htm/preact";
import { Chart } from "chart.js";

import { FORECASTS, OBSERVATIONS, NAME, LATLONG } from "./data.js";

/**
 * @param {Chart} obs
 * @param {Chart} fore
 */
function updateCharts(obs, fore) {
    obs.data.labels = OBSERVATIONS.value.map((point) =>
        point.time.toLocaleTimeString(),
    );
    fore.data.labels = FORECASTS.value.map((point) =>
        point.time.toLocaleTimeString(),
    );

    const shared = {
        spanGaps: true,
        borderJoinStyle: "round",
        pointRadius: 0,
        borderWidth: 2,
        pointHoverRadius: 10,
    };

    /**
     * @param {import("./data.js").WeatherData[]} data
     */
    const createWarningLines = (data) => [
        {
            label: "A-Kelpparit",
            data: data.map(() => 11),
            borderColor: "red",
            pointRadius: 0,
        },
        {
            label: "Oppilasraja",
            data: data.map(() => 8),
            borderColor: "orange",
            pointRadius: 0,
        },
    ];

    obs.data.datasets = [
        {
            ...shared,
            label: "Puuska (m/s)",
            data: OBSERVATIONS.value.map((obs) => obs.gust).reverse(),
            borderColor: "blue",
        },
        ...createWarningLines(OBSERVATIONS.value),
    ];

    fore.data.datasets = [
        {
            ...shared,
            label: "Puuska Ennuste (m/s)",
            data: FORECASTS.value.map((obs) => obs.gust),
            borderColor: "lightblue",
            cubicInterpolationMode: "monotone",
            borderDash: [5, 5],
            borderWidth: 5,
        },
        ...createWarningLines(FORECASTS.value),
    ];

    obs.update();
    fore.update();
}

export function Graph() {
    const obsChartRef = useRef(null);
    const foreChartRef = useRef(null);

    useEffect(() => {
        /**
         * @type {any}
         */
        const options = {
            type: "line",
            data: {
                labels: [],
                datasets: [],
            },
            options: {
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    axis: "x",
                    intersect: false,
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        };

        if (!obsChartRef.current || !foreChartRef.current) {
            console.error("Chart references are not initialized.");
            return;
        }

        const obsChart = new Chart(
            obsChartRef.current,
            structuredClone(options),
        );
        const foreChart = new Chart(
            foreChartRef.current,
            structuredClone(options),
        );

        effect(() => {
            updateCharts(obsChart, foreChart);
        });

        return () => {
            obsChart.destroy();
            foreChart.destroy();
        };
    }, []);

    return html`<div class="graphs">
        <h2 id="observation-graph">Havainnot</h2>
        <div class="chart">
            <canvas ref=${obsChartRef}></canvas>
        </div>
        <h2 id="forecast-graph">Ennusteet</h2>
        <div class="chart">
            <canvas ref=${foreChartRef}></canvas>
        </div>
    </div>`;
}
