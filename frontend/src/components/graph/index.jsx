import React, {useEffect, useRef} from "react";
import functionPlot from "function-plot";
import styled from "styled-components";

const Container = styled.div`
    width: 100%;
    overflow: auto;

    .function-plot .x.axis-label,
    .function-plot .y.axis-label {
        fill: var(--color-text, #fff) !important;
        stroke: none !important;
    }
`

const FunctionGraph = ({expressions}) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        const lines = expressions
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        const data = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // === Text annotation ===
            const textMatch = line.match(/^@text\(([^,]+),\s*([^)]+)\):\s*(.+)$/);
            if (textMatch) {
                const x = parseFloat(textMatch[1]);
                const y = parseFloat(textMatch[2]);
                const text = textMatch[3];
                data.push({
                    fnType: "text",
                    graphType: "text",
                    location: [x, y],
                    text
                });
                continue;
            }

            // === Vector ===
            const vectorMatch = line.match(/^vector\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/);
            if (vectorMatch) {
                const x0 = parseFloat(vectorMatch[1]);
                const y0 = parseFloat(vectorMatch[2]);
                const dx = parseFloat(vectorMatch[3]);
                const dy = parseFloat(vectorMatch[4]);
                data.push({
                    fnType: "vector",
                    graphType: "polyline",
                    offset: [x0, y0],
                    vector: [dx, dy]
                });

                data.push({
                    fnType: "text",
                    graphType: "text",
                    location: [x0 + dx, y0 + dy],
                    text: `(${x0 + dx}, ${y0 + dy})`
                });
                continue;
            }

            // === Points ===
            const pointsMatch = line.match(/^points\((.+)\)$/);
            if (pointsMatch) {
                const pointPairs = pointsMatch[1].split(";").map(p => {
                    const [x, y] = p.split(",").map(Number);
                    return [x, y];
                });
                data.push({
                    fnType: "points",
                    graphType: "scatter",
                    points: pointPairs
                });

                pointPairs.forEach(([x, y]) => {
                    data.push({
                        fnType: "text",
                        graphType: "text",
                        location: [x, y],
                        text: `(${x}, ${y})`
                    });
                });
                continue;
            }

            // === Parametric ===
            const xMatch = line.match(/^x\(t\)\s*=\s*(.+)$/i);
            const yLine = lines[i + 1]?.match(/^y\(t\)\s*=\s*(.+)$/i);
            if (xMatch && yLine) {
                data.push({
                    fnType: "parametric",
                    graphType: "polyline",
                    x: xMatch[1],
                    y: yLine[1],
                    range: [0, 2 * Math.PI],
                    sampler: "builtIn"
                });
                i++; // Skip next line (y(t))
                continue;
            }

            // === Polar ===
            const polarMatch = line.match(/^r\s*=\s*(.+)$/i);
            if (polarMatch) {
                data.push({
                    fnType: "polar",
                    r: polarMatch[1],
                    range: [-Math.PI, Math.PI],
                    graphType: "polyline",
                });
                continue;
            }

            // === Regular function: y = f(x) ===
            const regMatch = line.match(/^y\s*=\s*(.+)$/i);
            if (regMatch) {
                data.push({
                    fn: regMatch[1],
                    graphType: "polyline",
                    label: line,
                    skipTip: false,
                    sampler: "builtIn"
                });
                continue;
            }

            // === Implicit function: anything with both x and y and an = ===
            const implicitMatch = line.match(/^[^=]+=[^=]+$/);
            if (implicitMatch && /[xy]/.test(line)) {
                const [left, right] = line.split("=");
                data.push({
                    fnType: "implicit",
                    fn: `${left} - (${right})`,
                    sampler: "interval", // Required!
                    graphType: "polyline"
                });
                continue;
            }

            // === Fallback (assume y = ...)
            data.push({
                fn: line,
                graphType: "polyline",
                label: line,
                skipTip: false,
            });
        }

        try {
            ref.current.innerHTML = "";

            functionPlot({
                target: ref.current,
                width: 600,
                height: 400,
                grid: true,
                disableZoom: false,
                xAxis: {
                    label: "X axis",
                    domain: [-10, 10],
                },
                yAxis: {
                    label: "Y axis",
                    domain: [-10, 10],
                },
                data,
                tip: {
                    xLine: true,
                    yLine: true,
                    renderer: (x, y, index) => {
                        const eq = data[index]?.label ?? 'Equation';
                        return `${eq}\nx = ${x.toFixed(2)}, y = ${y.toFixed(2)}`;
                    },
                },
            });
        } catch (err) {
            console.error("Function plot error:", err);
            ref.current.innerHTML = `<div
                               style="color: var(--color-danger); padding: 10px; font-weight: bold; white-space: wrap; word-break: break-word;"
                               >Failed to render the graph. Please check your expressions.  ${err.message || String(err)}</div>`;
        }
    }, [expressions]);

    return <Container ref={ref}/>;
};

export default React.memo(FunctionGraph);
