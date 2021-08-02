import useCurrentLocation from "./useCurrentLocation";

const useButtonLocation = () => {
    const { getMyLocation, location } = useCurrentLocation();

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

    /* Event Handlers */
    function myLocation() {
        getMyLocation();
    }

    const button = new MapboxGLButtonControl({
        className: "mapbox-gl-draw_point",
        title: "My location",
        eventHandler: myLocation,
    });

    return { button, location };
};

export default useButtonLocation;
