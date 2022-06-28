import React, { useState, useEffect, useCallback, useMemo } from "react";
import useHttp from "../../hooks/use-http";

const AssemblySelector = (props) => {
  const { trackSourceServers } = props;
  const [availChromSizes, setAvailChromSizes] = useState({});
  const [selectedAssembly, setSelectedAssembly] = useState(null);

  const availAssembly = useMemo(
    () => Object.keys(availChromSizes),
    [availChromSizes]
  );

  useEffect(() => {
    if (!selectedAssembly && availAssembly.length > 0) {
      setSelectedAssembly(availAssembly[0]);
    }
  }, [availAssembly]);

  const { isLoading, error, sendRequest: fetchChromSizes } = useHttp();

  const transformChromSizes = useCallback((sourceServer, data) => {
    const newChromSizes = data.results.map((chromsize) => ({
      ...chromsize,
      server: sourceServer,
    }));

    setAvailChromSizes((prevChromSizes) => {
      const updatedChromSizes = { ...prevChromSizes };
      newChromSizes.forEach((chromsize) => {
        const { coordSystem } = chromsize;
        if (!(coordSystem in updatedChromSizes)) {
          updatedChromSizes[coordSystem] = new Array();
        }
        updatedChromSizes[coordSystem].push(chromsize);
      });
      return updatedChromSizes;
    });
  }, []);

  useEffect(() => {
    if (!trackSourceServers) {
      return;
    }
    trackSourceServers.forEach((sourceServer) => {
      console.log("fetch chromsizes");
      fetchChromSizes(
        { url: `${sourceServer.url}/available-chrom-sizes/` },
        transformChromSizes.bind(null, sourceServer.url)
      );
    });
  }, [trackSourceServers, fetchChromSizes, transformChromSizes]);

  const selectAssemblyHandler = (event) => {
    setSelectedAssembly(event.target.value);
  };

  return (
    <div>
      <p>Assembly:</p>
      {isLoading && <p>Loading assembly...</p>}
      {error && <p>Error: {error}</p>}
      {!isLoading && !error && availAssembly.length > 0 && (
        <select value={selectedAssembly} onChange={selectAssemblyHandler}>
          {availAssembly.map((assembly) => (
            <option key={assembly} value={assembly}>
              {assembly}
            </option>
          ))}
        </select>
      )}
      {selectedAssembly && (
        <div>
          <p>{selectedAssembly}</p>
          <code>
            {JSON.stringify(availChromSizes[selectedAssembly][0], null, 2)}
          </code>
        </div>
      )}
    </div>
  );
};

export default AssemblySelector;
