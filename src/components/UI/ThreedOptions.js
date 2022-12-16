import React, { useContext } from "react";
import ConfigContext from "../../store/config-context";
import Collapsible from "./Collapsible";
import ThreedOptionForm from "./ThreedOptionForm";

const ThreedOptions = (props) => {
  const ctx = useContext(ConfigContext);
  const threed = ctx.threeCases[props.caseUid];

  if (threed === undefined) {
    return <></>;
  }

  const submitHandler = (values) => {
    ctx.updateThreedOptions(values, props.caseUid);
  };

  return (
    <Collapsible title="3D Genome Structure Track" defaultCollapsed>
      <ThreedOptionForm 
        opacity={threed.opacity}
        colormap={threed.colormap}
        onSubmit={submitHandler}
      />
    </Collapsible>
  );
};

export default ThreedOptions;
