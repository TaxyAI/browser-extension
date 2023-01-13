import React, { useEffect } from 'react';
import useAsyncEffect from 'use-async-effect';
import logo from '../../assets/img/logo.svg';
// import Greetings from '../../containers/Greetings/Greetings';
import performSearch from './search';

const Popup = () => {
  const [searchResults, setSearchResults] = React.useState('searching');

  useAsyncEffect(async () => {
    setSearchResults(await performSearch('What color is the sky?'));
  }, []);

  return (
    <div className="App">
      <div>{searchResults}</div>
    </div>
  );
};

export default Popup;
