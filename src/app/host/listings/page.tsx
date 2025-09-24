"use client";

import { useState } from "react";
import { ListingHeader } from "./listingHeader";
import { Listproperty } from "./listPropery";
import { useProperties } from "../../../hooks/useProperties";

export default function ListingPage() {
  const [activeFilter, setActiveFilter] = useState("All Properties");
  const { data } = useProperties({ page: 1 });

  return (
    <div>
      <ListingHeader
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        stats={data?.stats}
      />
      <Listproperty filter={activeFilter} />
    </div>
  );
}
