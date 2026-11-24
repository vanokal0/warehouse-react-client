import { FC } from "react";
import { WarehouseData } from "../../typing";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const WarehouseGoogleMap: FC<Props> = ({ warehouses }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  return (
    isLoaded && (
      <GoogleMap
        center={warehouses[0].location}
        zoom={8}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      >
        {warehouses.map((warehouse: WarehouseData) => (
          <Marker
            key={`marker-${warehouse.number}`}
            position={warehouse.location}
            title={warehouse.number}
          />
        ))}
      </GoogleMap>
    )
  );
};

export default WarehouseGoogleMap;
type Props = { warehouses: WarehouseData[] };
