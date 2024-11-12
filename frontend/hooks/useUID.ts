import { useState } from 'react';
import {v4 as uuidv4} from 'uuid';

const useUID = (): [() => string] => {
	const [uidStore, setUIDStore] = useState({});

	const generateUID = () => {
		// setUIDStore((prevStore) => ({ ...prevStore, [newUID]: newUID }));
		return uuidv4();
	};

	return [generateUID];
};

export default useUID;
