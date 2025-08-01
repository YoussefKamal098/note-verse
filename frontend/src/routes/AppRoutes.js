import React, {Suspense} from 'react';
import {Route, Routes} from 'react-router-dom';
import Loader from '../components/common/Loader';
import {ErrorBoundary} from 'react-error-boundary';
import ErrorFallbackPage from "../pages/ErrorFallbackPage";
import RoutesDefinition from "./RoutesDefinition";

const AppRoutes = () => (
    <ErrorBoundary FallbackComponent={ErrorFallbackPage} fallback={<Loader/>}>
        <Suspense fallback={<Loader/>}>
            <Routes>
                {RoutesDefinition.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element}>
                        {route.children?.map((childRoute, childIndex) => (
                            <Route
                                key={childIndex}
                                index={childRoute.index}
                                path={childRoute.path}
                                element={childRoute.element}
                            />
                        ))}
                    </Route>
                ))}
            </Routes>
        </Suspense>
    </ErrorBoundary>
);

export default React.memo(AppRoutes);
