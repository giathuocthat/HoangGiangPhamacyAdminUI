import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FeatureModule from "./feature-module/feature-module";
import { authRoutes, posPages, unAuthRoutes } from "./routes/path";
import { base_path } from "./environment";
import ProtectedRoute from "./components/ProtectedRoute";

const AppRouter = () => {
  const RouterContent = React.memo(() => {
    const renderRoutes = (routeList, isProtected) =>
      routeList?.map((item) =>
        <Route
          key={`route-${item?.id}`}
          path={item?.path}
          element={isProtected ? <ProtectedRoute>{item?.element}</ProtectedRoute> : item?.element} />

      );

    return (
      <>
        <Routes>
          <Route path="/" element={<FeatureModule />}>
            {renderRoutes(unAuthRoutes, false)}
            {renderRoutes(authRoutes, true)}
            {renderRoutes(posPages, true)}
          </Route>
        </Routes>
      </>);

  });

  return (
    <BrowserRouter basename={base_path}>
      <RouterContent />
    </BrowserRouter>);

};

export default AppRouter;