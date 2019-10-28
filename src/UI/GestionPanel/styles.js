const styles = theme => {
  return {
    boton: {
      padding: '8px',
      backgroundColor: 'white',
      borderRadius: '8px',
      width: '100%',
      transition: 'all 0.3s',
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.05)',
      }
    }
  };
};

export default styles;
