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

  useEffect(() => {
    if (!selectedAssembly) {
      return;
    }
    const chromSize = availChromSizes[selectedAssembly][0];
    // chromInfoPath format
    // 'http://higlass.io/api/v1/chrom-sizes/?id=Ajn_ttUUQbqgtOD4nOt-IA'
    props.onGenomeAssemblyChange({
      assemblyName: selectedAssembly,
      chromInfoPath: `${chromSize.server}/chrom-sizes/?id=${chromSize.uuid}`,
    });
  }, [selectedAssembly]);

  return (
    <div className="control-section">
      <label>
        <strong>Genome assembly:</strong>
      </label>
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
    </div>
  );
};

export default AssemblySelector;
