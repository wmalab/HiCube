import React, { useState, useEffect, useCallback, useMemo } from "react";
import useHttp from "../../hooks/use-http";

// Get available tilesets from API
// filter by filetype `?t={}` or datatype `?dt={}`
// additional filter by `project_name` or `coordSystem` or keywords
// use `${sourceServer}/tilesets/?limit=10000&${datatypesQuery}`
// types: filetype, datatype, tracktype
const TrackSelector = (props) => {
  const { datatype, assembly, trackSourceServers } = props;
  const [datasets, setDatasets] = useState({});
  const [selectedUuid, setSelectedUuid] = useState(null);

  // only hold the serverUidKey in an array
  const filteredDatasets = useMemo(() => {
    if (!assembly) {
      return Object.keys(datasets);
    }
    return Object.keys(datasets).filter(
      (serverUidKey) => datasets[serverUidKey].coordSystem === assembly
    );
  }, [datasets, assembly]);

  useEffect(() => {
    if (!selectedUuid && filteredDatasets.length > 0) {
      setSelectedUuid(filteredDatasets[0]);
    }
  }, [filteredDatasets]);

  const { isLoading, error, sendRequest: fetchDatasets } = useHttp();

  const transformDatasets = useCallback((sourceServer, data) => {
    const newDatasets = data.results.map((dataset) => ({
      ...dataset,
      server: sourceServer,
      tilesetUid: dataset.uuid,
      serverUidKey: `${sourceServer}/${dataset.uuid}`,
    }));

    setDatasets((prevDatasets) => {
      const updatedDatasets = { ...prevDatasets };
      newDatasets.forEach((dataset) => {
        updatedDatasets[dataset.serverUidKey] = dataset;
      });
      return updatedDatasets;
    });
  }, []);

  useEffect(() => {
    if (!trackSourceServers || !datatype) {
      return;
    }
    const query = `dt=${datatype}`;
    trackSourceServers.forEach((sourceServer) => {
      console.log("fetch datasets");
      fetchDatasets(
        { url: `${sourceServer.url}/tilesets/?limit=10000&${query}` },
        transformDatasets.bind(null, sourceServer.url)
      );
    });
  }, [trackSourceServers, datatype, fetchDatasets, transformDatasets]);

  const selectDatasetHandler = (event) => {
    setSelectedUuid(event.target.value);
  };

  return (
    <div>
      <p>Track datasets:</p>
      {isLoading && <p>Loading datasets...</p>}
      {error && <p>Error: {error}</p>}
      {!isLoading && !error && filteredDatasets.length > 0 && (
        <select value={selectedUuid} onChange={selectDatasetHandler}>
          {filteredDatasets.map((serverUidKey) => (
            <option value={serverUidKey} key={serverUidKey}>
              {datasets[serverUidKey].name}
            </option>
          ))}
        </select>
      )}
      {selectedUuid && <p>{datasets[selectedUuid].name}</p>}
    </div>
  );
};

export default TrackSelector;
