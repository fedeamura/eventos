const styles = theme => {
  return {
    evento: {
      marginBottom: 16,
      borderRadius: 16,
      "& > .content": {
        padding: 16,
        width: "100%",
        justifyContent: "flex-start",
        '& > div': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }
      }
    }
  };
};

export default styles;
