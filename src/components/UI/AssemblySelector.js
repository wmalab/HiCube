import React, { useState, useEffect, useCallback, useMemo } from "react";
import Collapsible from "./Collapsible";
import useHttp from "../../hooks/use-http";
import classes from "./AssemblySelector.module.css";

const AssemblySelector = (props) => {
  const { trackSourceServers } = props;
  const [availChromSizes, setAvailChromSizes] = useState({});
  const [selectedAssembly, setSelectedAssembly] = useState(null);

  useEffect(() => {
    const availAssembly = Object.keys(availChromSizes);
    if (availAssembly.length === 0) {
      // setSelectedAssembly(null);
      return;
    }
    if (!selectedAssembly || !availAssembly.includes(selectedAssembly)) {
      setSelectedAssembly(availAssembly[0]);
    }
  }, [availChromSizes]);

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
    // empty the current avail chromsizes
    setAvailChromSizes({});
    if (!trackSourceServers || trackSourceServers.length === 0) {
      return;
    }

    trackSourceServers.forEach((sourceServer) => {
      console.log(`Fetch chromsizes from ${sourceServer.url}`);
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
    if (!selectedAssembly || !(selectedAssembly in availChromSizes)) {
      return;
    }
    const chromSize = availChromSizes[selectedAssembly][0];
    // chromInfoPath format
    // 'http://higlass.io/api/v1/chrom-sizes/?id=Ajn_ttUUQbqgtOD4nOt-IA'
    props.onGenomeAssemblyChange({
      assemblyName: selectedAssembly,
      name: chromSize.name,
      server: chromSize.server,
      tilesetUid: chromSize.uuid,
      chromInfoPath: `${chromSize.server}/chrom-sizes/?id=${chromSize.uuid}`,
    });
  }, [selectedAssembly, availChromSizes]);

  const availAssembly = Object.keys(availChromSizes);

  let message = "";
  if (!trackSourceServers || trackSourceServers.length === 0) {
    message = "Add server first.";
  } else if (isLoading) {
    message = "Loading...";
  } else if (error) {
    message = error;
  } else if (availAssembly.length === 0) {
    message = "No available genomes.";
  }

  return (
    <Collapsible title="Genome Assembly">
      <div className={classes.selector}>
        <label>Genome:</label>
        {message && <p className={classes.message}>{message}</p>}
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
    </Collapsible>
  );
};

export default AssemblySelector;
