const styles = theme => {
  return {
    paginaContent: {
      overflow: "auto"
    },
    contentClassName: {
      display: "flex",
      flexDirection: "column",
      height: "100%"
    },
    toolbar: {
      backgroundColor: "white",
      "& h2": {
        color: "black"
      },
      "& h3": {
        color: "black"
      },
      color: "black"
    },
    children: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      cursor: "pointer",
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
      },
      '& > .icono': {
        marginRight: 8
      },
      '*': {
        cursor: "pointer"
      }
    }
  };
};

export default styles;
