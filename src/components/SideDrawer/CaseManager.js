import React, { useContext } from "react";
import ConfigContext from "../../store/config-context";
import Collapsible from "../UI/Collapsible";

const CaseManager = (props) => {
  const ctx = useContext(ConfigContext);

  const caselist = [];
  ctx.cases.forEach((caseConfig, index) => {
    const caseUid = caseConfig.uid;
    caselist.push(
      <Collapsible
        key={caseUid}
        title={`Case #${index + 1}`}
        onDelete={ctx.deleteCase.bind(null, caseUid)}
      ></Collapsible>
    );
  });

  return <Collapsible title="Manage Cases">{caselist}</Collapsible>;
};

export default CaseManager;
