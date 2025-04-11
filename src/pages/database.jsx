import React, { useState, useEffect } from "react";

import { useLoading } from "../context/useLoading";

import ManifestTable from "../ui/table";

const Database = () => {  
  const { setLoading } = useLoading();

  return (
    <div className="flex h-full w-full">
      <div className="relative flex h-full w-full flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Database</h2>
        </div>        
        <div className="rounded-lg p-6 flex flex-col justify-center  w-full h-full">
          <ManifestTable isFull={true} />
        </div>
      </div>
    </div>
  );
};

export default Database;
