import React from "react";

import styles from "./Counter.module.css";

export const Counter = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className={styles.linkCard}>
      <button onClick={() => setCount((c) => c + 1)} style={{}}>
        Count: {count}
      </button>
    </div>
  );
};
