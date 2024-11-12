// @flow
import * as React from 'react';

interface MapEmbedProps {
    position: {
        lat: number;
        lng: number;
    };
    width?: number;
    height?: number;
    zoom?: number;
}

const MapEmbed: React.FC<MapEmbedProps> = ({
                                               position,
                                               width = 600,
                                               height = 400,
                                               zoom = 14,
                                           }) => {
    const src = `https://maps.google.com/maps?width=${width}&height=${height}&hl=en&q=${position.lat},${position.lng}&t=&z=${zoom}&ie=UTF8&iwloc=B&output=embed`;

    return (
        <div className="mapouter relative text-right h-[200px] sm:h-[250px] w-full">
            <div className="gmap_canvas !w-full !h-full overflow-hidden bg-none" style={{ width, height }}>
                <iframe
                    className="gmap_iframe !w-full !h-full absolute top-0 left-0"
                    style={{ width, height }}
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={src}
                    title="Google Map"
                />
            </div>
        </div>
    );
};

export default MapEmbed;