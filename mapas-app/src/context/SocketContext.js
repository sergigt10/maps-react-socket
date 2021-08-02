import React from "react";
import { createContext } from "react";
import { useSocket } from "../hooks/useSocket";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
	const { socket, online } = useSocket("http://localhost:8080");

	// http://localhost:8080
	// https://react-map-live.herokuapp.com

	return (
		<SocketContext.Provider value={{ socket, online }}>
			{children}
		</SocketContext.Provider>
	);
};
