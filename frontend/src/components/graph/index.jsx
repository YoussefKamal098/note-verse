import React, {useEffect, useRef} from "react";
import functionPlot from "function-plot";
import styled from "styled-components";

// Constants
const DEFAULT_DOMAIN = [-10, 10];
const DEFAULT_RANGE = [0, 2 * Math.PI];
const POLAR_RANGE = [-Math.PI, Math.PI];
const GRAPH_DIMENSIONS = {width: 600, height: 400};

// Styled Components
const Container = styled.div`
    width: 100%;
    overflow: auto;

    .function-plot .x.axis-label,
    .function-plot .y.axis-label {
        fill: var(--color-text, #fff) !important;
        stroke: none !important;
    }

    .graph-error {
        color: var(--color-danger);
        padding: 10px;
        font-weight: bold;
        white-space: wrap;
        word-break: break-word;
    }
`;

// Parser Strategies
const expressionParsers = {
    text: (line) => {
        const match = line.match(/^@text\(([^,]+),\s*([^)]+)\):\s*(.+)$/);
        if (!match) return null;

        return {
            fnType: "text",
            graphType: "text",
            location: [parseFloat(match[1]), parseFloat(match[2])],
            text: match[3]
        };
    },

    vector: (line) => {
        const match = line.match(/^vector\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/);
        if (!match) return null;

        const x0 = parseFloat(match[1]);
        const y0 = parseFloat(match[2]);
        const dx = parseFloat(match[3]);
        const dy = parseFloat(match[4]);

        return [
            {
                fnType: "vector",
                graphType: "polyline",
                offset: [x0, y0],
                vector: [dx, dy]
            },
            {
                fnType: "text",
                graphType: "text",
                location: [x0 + dx, y0 + dy],
                text: `(${x0 + dx}, ${y0 + dy})`
            }
        ];
    },

    points: (line) => {
        const match = line.match(/^points\((.+)\)$/);
        if (!match) return null;

        const pointPairs = match[1].split(";").map(p => {
            const [x, y] = p.split(",").map(Number);
            return [x, y];
        });

        const result = [{
            fnType: "points",
            graphType: "scatter",
            points: pointPairs
        }];

        pointPairs.forEach(([x, y]) => {
            result.push({
                fnType: "text",
                graphType: "text",
                location: [x, y],
                text: `(${x}, ${y})`
            });
        });

        return result;
    },

    parametric: (line, nextLine) => {
        const xMatch = line.match(/^x\(t\)\s*=\s*(.+)$/i);
        const yMatch = nextLine?.match(/^y\(t\)\s*=\s*(.+)$/i);
        if (!xMatch || !yMatch) return null;

        return {
            data: {
                fnType: "parametric",
                graphType: "polyline",
                x: xMatch[1],
                y: yMatch[1],
                range: DEFAULT_RANGE,
                sampler: "builtIn"
            },
            skipNext: true
        };
    },

    polar: (line) => {
        const match = line.match(/^r\s*=\s*(.+)$/i);
        if (!match) return null;

        return {
            fnType: "polar",
            r: match[1],
            range: POLAR_RANGE,
            graphType: "polyline",
        };
    },

    regular: (line) => {
        const match = line.match(/^y\s*=\s*(.+)$/i);
        if (!match) return null;

        return {
            fn: match[1],
            graphType: "polyline",
            label: line,
            skipTip: false,
            sampler: "builtIn"
        };
    },

    implicit: (line) => {
        const match = line.match(/^[^=]+=[^=]+$/);
        if (!match || !/[xy]/.test(line)) return null;

        const [left, right] = line.split("=");
        return {
            fnType: "implicit",
            fn: `${left} - (${right})`,
            sampler: "interval",
            graphType: "polyline"
        };
    },

    fallback: (line) => ({
        fn: line,
        graphType: "polyline",
        label: line,
        skipTip: false,
    })
};

// Helper Functions
const parseExpressions = (expressions) => {
    const lines = expressions
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    const data = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let result = null;
        let skipNext = false;

        for (const parser of Object.values(expressionParsers)) {
            const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
            const parsed = parser(line, nextLine, i);

            if (parsed) {
                if (parsed.data) {
                    result = parsed.data;
                    skipNext = parsed.skipNext;
                } else {
                    result = parsed;
                }
                break;
            }
        }

        if (Array.isArray(result)) {
            data.push(...result);
        } else if (result) {
            data.push(result);
        }

        if (skipNext) i++;
    }

    return data;
};

const renderGraph = (container, data) => {
    try {
        container.innerHTML = "";

        functionPlot({
            target: container,
            ...GRAPH_DIMENSIONS,
            grid: true,
            disableZoom: false,
            xAxis: {
                label: "X axis",
                domain: DEFAULT_DOMAIN,
            },
            yAxis: {
                label: "Y axis",
                domain: DEFAULT_DOMAIN,
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
        container.innerHTML = `<div class="graph-error">Failed to render the graph. Please check your expressions. ${err.message || String(err)}</div>`;
    }
};

const FunctionGraph = ({expressions}) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        const data = parseExpressions(expressions);
        renderGraph(ref.current, data);
    }, [expressions]);

    return <Container ref={ref}/>;
};

export default React.memo(FunctionGraph);
