import { lazy, Suspense } from "react";

const IndexedLazyComponent = lazy(() => import("../IndexedLazyComponent"));

export default function LazyComponent() {
  return (
    <div>
      <h1>Lazy Component</h1>
      <Suspense fallback={null}>
        <IndexedLazyComponent />
      </Suspense>
    </div>
  );
}
