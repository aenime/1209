import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SkeletonLoader = React.memo(({ isSinglePage = false }) => (
  <div className="w-full">
    <Skeleton height={isSinglePage ? 410 : 210} />
    {!isSinglePage && <Skeleton width={80} />}
    <Skeleton count={2} height={10} />
  </div>
));

export default SkeletonLoader;
