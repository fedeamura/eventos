const styles = theme => {
  return {
    animSorteo: {
      opacity: 0,
      transition: "all 0.2s",
      "&.visible": {
        opacity: 1
      }
    }
  };
};

export default styles;
