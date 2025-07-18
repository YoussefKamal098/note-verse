import {useEffect} from "react";
import {select} from "d3-selection";
import {zoom, zoomIdentity} from "d3-zoom";

/**
 * React hook to enable zooming and panning on any HTML element.
 *
 * This hook sets up D3's zoom behavior on a container element,
 * applying `transform: translate(...) scale(...)` CSS style
 * to the wrapper element as the user pans or zooms.
 *
 * @param {React.RefObject<HTMLElement>} containerRef - Ref to the container element where zoom gestures are captured.
 * @param {React.RefObject<HTMLElement>} wrapperRef - Ref to the element that will be visually transformed.
 * @param {any[]} [dependencies=[]] - Dependency array to control when the zoom setup is re-initialized.
 * @param {[number, number]} [scaleExtent=[0.2, 4]] - Minimum and maximum zoom scale.
 *
 * @example
 * const containerRef = useRef(null);
 * const wrapperRef = useRef(null);
 * useZoomPan(containerRef, wrapperRef);
 *
 * return (
 *   <div ref={containerRef} style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
 *     <div ref={wrapperRef} style={{ width: 'max-content', height: 'max-content' }}>
 *       {Zoomable content here}
 *     </div>
 *   </div>
 * );
 */
export const useZoomPan = (
    containerRef,
    wrapperRef,
    dependencies = [],
    scaleExtent = [0.2, 4]
) => {
    useEffect(() => {
        let rafId = null;
        let zoomInstance = null;
        let applied = false;
        let destroyed = false;

        const tryApplyZoom = () => {
            if (destroyed || applied) return;

            const container = containerRef.current;
            const wrapper = wrapperRef.current;

            if (container && wrapper) {
                // Create D3 zoom instance
                zoomInstance = zoom()
                    .scaleExtent(scaleExtent)
                    .on("zoom", (event) => {
                        const {x, y, k} = event.transform;
                        
                        // FIXME: Zoom is not centered properly.
                        wrapper.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
                    });

                const containerSelection = select(container);
                containerSelection.call(zoomInstance);
                containerSelection.call(zoomInstance.transform, zoomIdentity);

                applied = true;
            } else {
                rafId = requestAnimationFrame(tryApplyZoom);
            }
        };

        rafId = requestAnimationFrame(tryApplyZoom);

        return () => {
            destroyed = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (zoomInstance && containerRef.current) {
                select(containerRef.current).on(".zoom", null);
            }
        };
    }, [...dependencies]);
};
