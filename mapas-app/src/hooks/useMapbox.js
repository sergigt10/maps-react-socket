import { useRef, useState, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { v4 } from "uuid";
import { Subject } from "rxjs";

mapboxgl.accessToken =
	"pk.eyJ1Ijoic2VyZ2lyZWFjdCIsImEiOiJja2k5NHljYW8wYzZnMnNsYm0wZmxidzFsIn0.DkjOsJtIpy3d4bN68H48Rw";

const useMapbox = (puntoInicial, geolocationOptions) => {
	// Coordenadas del puntoInicial
	const [coords, setCoords] = useState(puntoInicial);

	// Guardamos la localización actual
	const [location, setLocation] = useState();

	// En caso de error de la localización
	const [setError] = useState();

	// Controlamos si hemos marcado el punto
	const markerMap = useRef(false);

	// Obtenemos el id del marcador
	const markerID = useRef();

	// Obtenemos el color del marcador
	const colorMarker = useRef();

	// Referencia al DIV del mapa sin importar si se refresca
	const mapaDiv = useRef();

	// Memorizar el resultado de esta función
	const setRef = useCallback((node) => {
		mapaDiv.current = node;
	}, []);

	// Lista de marcadores en el mapa
	const marcadores = useRef({});

	//console.log(marcadores.current);

	// Observables de Rxjs
	const movimientoMarcador = useRef(new Subject());
	const nuevoMarcador = useRef(new Subject());

	// Para que no se llame el evento move X veces. Sólo una vez.
	const mapa = useRef();

	// Función para agregar marcadores. Callback porqué no se vaya ejecutando cada vez
	const agregarMarcador = useCallback((ev, id) => {
		console.log("bucle");
		const { lng, lat } = ev.lngLat || ev;

		const nouColor = "#" + ((Math.random() * 0xffffff) << 0).toString(16);

		const marker = new mapboxgl.Marker({
			color: ev.color || nouColor,
		});

		// Si el id no viene usar v4 sino id
		marker.id = id ?? v4();

		marker.setLngLat([lng, lat]).addTo(mapa.current);
		// .setDraggable(true)
		// .setPopup(popup)

		// Asignamos al objeto de marcadores
		marcadores.current[marker.id] = marker;

		// console.log("ID creat: ", marker.id);

		// Si el marcador tiene ID no emitir ya que no es un nuevo marcador. No es un marcador creado por nosotros.
		if (!id) {
			nuevoMarcador.current.next({
				id: marker.id,
				lng,
				lat,
				color: nouColor,
			});
			// Almacenamos nuestra ID y color
			markerID.current = marker.id;
			colorMarker.current = nouColor;
			// console.log("He creat un nou marker: ", markerID.current);
		}
	}, []);

	// Funcion para actualizar la ubicación del marcador
	const actualizarPosicion = useCallback(({ id, lng, lat }) => {
		marcadores.current[id].setLngLat([lng, lat]);
	}, []);

	// Iniciamos el mapa
	useEffect(() => {
		console.log("Generar mapa");
		var map = new mapboxgl.Map({
			container: mapaDiv.current,
			// style: 'mapbox://styles/mapbox/streets-v11',
			style: "mapbox://styles/mapbox/satellite-v9",
			center: [puntoInicial.lng, puntoInicial.lat],
			zoom: puntoInicial.zoom,
		});

		/* Start Get my location */
		const handleSuccess = (pos) => {
			const { latitude, longitude } = pos.coords;

			setLocation({
				lng: longitude,
				lat: latitude,
			});
		};
		const handleError = (error) => {
			setError(error.message);
		};
		const getMyLocation = () => {
			const { geolocation } = navigator;
			if (!geolocation) {
				setError("Geolocation is not supported.");
				return;
			}
			geolocation.watchPosition(
				handleSuccess,
				handleError,
				geolocationOptions
			);
		};
		/* End Get my location */

		/* Start Boton */
		class MapboxGLButtonControl {
			constructor({ className = "", title = "", eventHandler = "" }) {
				this._className = " " + className;
				this._title = title;
				this._eventHandler = eventHandler;
			}
			onAdd() {
				this._btn = document.createElement("button");
				this._btn.className = "mapboxgl-ctrl-icon" + this._className;
				this._btn.type = "button";
				this._btn.title = this._title;
				this._btn.onclick = this._eventHandler;

				this._container = document.createElement("div");
				this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
				this._container.appendChild(this._btn);

				return this._container;
			}
			onRemove() {
				this._container.parentNode.removeChild(this._container);
				this._map = undefined;
			}
		}

		function myLocation() {
			getMyLocation();
			drawPolygon[0].style.display = "none";
		}

		const button = new MapboxGLButtonControl({
			className: "mapbox-gl-draw_point",
			title: "My location",
			eventHandler: myLocation,
		});

		var drawPolygon = document.getElementsByClassName(
			"mapbox-gl-draw_point"
		);

		/* End Boton */
		map.addControl(button, "top-right");

		mapa.current = map;
	}, [puntoInicial, setError, geolocationOptions]);

	// Cuando se mueve el mapa: actualizar la barra superior izquierda
	// Solo se ejecuta una vez para llamar al listener -> move
	useEffect(() => {
		mapa.current?.on("move", () => {
			const { lng, lat } = mapa.current.getCenter();
			setCoords({
				lng: lng.toFixed(4),
				lat: lat.toFixed(4),
				zoom: mapa.current.getZoom().toFixed(2),
			});
		});
	}, []);

	// Marcamos nuestra ubicación o obtenemos la ubicación en tiempo real
	useEffect(() => {
		if (!location) return;

		if (!markerMap.current) {
			agregarMarcador(location);
			markerMap.current = true;
			// Volar a la posición del marcador
			mapa.current.flyTo({
				center: location,
				essential: true,
			});
		} else {
			const id = markerID.current;
			console.log("ID live: ", id);
			const color = colorMarker.current;
			const { lng, lat } = location;
			movimientoMarcador.current.next({ id, color, lng, lat });
			// console.log({ id, color, lng, lat });
		}
	}, [location, markerMap, agregarMarcador]);

	return {
		agregarMarcador,
		actualizarPosicion,
		coords,
		marcadores,
		nuevoMarcador$: nuevoMarcador.current,
		movimientoMarcador$: movimientoMarcador.current,
		setRef,
		location,
	};
};

export default useMapbox;
