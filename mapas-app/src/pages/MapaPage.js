import React, { useContext, useEffect } from "react";

import useMapbox from "../hooks/useMapbox";
import { SocketContext } from "../context/SocketContext";

// Definimos el puntoInicial del mapa
const puntoInicial = {
	lng: 2.2552,
	lat: 41.9298,
	zoom: 15,
};

// Definimos las opciones de geolocation
const geolocationOptions = {
	enableHighAccuracy: true,
	timeout: 1000 * 60 * 1, // 1 min (1000 ms * 60 sec * 1 minute = 60 000ms)
	maximumAge: 1000 * 3600 * 24, // 24 hour
};

const MapaPage = () => {
	const {
		coords,
		setRef,
		location,
		nuevoMarcador$,
		movimientoMarcador$,
		agregarMarcador,
		actualizarPosicion,
	} = useMapbox(puntoInicial, geolocationOptions);

	const { socket } = useContext(SocketContext);

	// Escuchar los marcadores existentes
	useEffect(() => {
		socket.on("marcadores-activos", (marcadores) => {
			for (const key of Object.keys(marcadores)) {
				agregarMarcador(marcadores[key], key);
			}
		});
	}, [socket, agregarMarcador]);

	// Nuevo marcador
	useEffect(() => {
		nuevoMarcador$.subscribe((marcador) => {
			// Nuevo marcador emitir
			socket.emit("marcador-nuevo", marcador);
		});
	}, [nuevoMarcador$, socket]);

	// Movimiento del marcador
	useEffect(() => {
		movimientoMarcador$.subscribe((marcador) => {
			socket.emit("marcador-actualizado", marcador);
		});
	}, [socket, movimientoMarcador$]);

	// Mover marcador mediante sockets
	useEffect(() => {
		socket.on("marcador-actualizado", (marcador) => {
			actualizarPosicion(marcador);
		});
	}, [socket, actualizarPosicion]);

	// Escuchar nuevo marcador
	useEffect(() => {
		socket.on("marcador-nuevo", (marcador) => {
			agregarMarcador(marcador, marcador.id);
		});
	}, [socket, agregarMarcador]);

	return (
		<>
			<div className="info">
				Lng: {coords.lng} | lat: {coords.lat} | zoom: {coords.zoom}
			</div>

			<div className="info-live">
				Lng: {location?.lng.toFixed(4)} | lat:{" "}
				{location?.lat.toFixed(4)}
			</div>

			<div ref={setRef} className="mapContainer" />
		</>
	);
};

export default MapaPage;
