import { LightningElement } from 'lwc';

export default class InsuredClientsMap extends LightningElement {
    // Coordonnées centrales pour la carte
    latitude = 40.730610;  // Point central
    longitude = -73.935242; // Point central

    // Clients positionnés autour du centre
    mapMarkers = [
        {
            location: { Latitude: 40.730610, Longitude: -73.935242 },
            title: 'John Doe - Group19',
            description: 'Insured with Group 19, covering life and health insurance.'
        },
        {
            location: { Latitude: 40.930700, Longitude: -73.935300 },
            title: 'Jane Smith - Vector19',
            description: 'Insured with Vector 19, focusing on property and car insurance.'
        },
        {
            location: { Latitude: 40.830800, Longitude: -73.935350 },
            title: 'Michael Brown - Group19',
            description: 'Insured with Group 19, providing comprehensive life insurance coverage.'
        },
        {
            location: { Latitude: 40.730900, Longitude: -73.935400 },
            title: 'Emma Johnson - Vector19',
            description: 'Insured with Vector 19, offering flexible health insurance options.'
        },
        {
            location: { Latitude: 40.735500, Longitude: -73.935450 },
            title: 'James Taylor - Group19',
            description: 'Insured with Group 19, offering robust coverage for accidents and illness.'
        },
        {
            location: { Latitude: 40.731100, Longitude: -73.935500 },
            title: 'Olivia Davis - Vector19',
            description: 'Insured with Vector 19, focusing on global health and wellness coverage.'
        },
        {
            location: { Latitude: 40.731200, Longitude: -73.925550 },
            title: 'David Wilson - Group19',
            description: 'Insured with Group 19, offering life insurance and financial security.'
        },
        {
            location: { Latitude: 40.831300, Longitude: -73.955600 },
            title: 'Sophia Martinez - Vector19',
            description: 'Insured with Vector 19, specializing in car and home insurance coverage.'
        },
        {
            location: { Latitude: 40.831400, Longitude: -73.795650 },
            title: 'Liam Anderson - Group19',
            description: 'Insured with Group 19, providing comprehensive family protection.'
        },
        {
            location: { Latitude: 40.731500, Longitude: -73.835700 },
            title: 'Isabella Thomas - Vector19',
            description: 'Insured with Vector 19, offering global travel and health insurance.'
        }
    ];
}
