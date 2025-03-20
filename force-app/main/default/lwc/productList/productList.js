import { LightningElement, wire } from 'lwc';
import getAllProducts from '@salesforce/apex/ProductController.getAllProducts';

export default class ProductList extends LightningElement {
    products;
    error;

    @wire(getAllProducts)
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data.map(product => ({
                ...product,
                Image_URL__c: product.Image_URL__c || 'https://via.placeholder.com/150' // Image par défaut
            }));
            this.error = undefined;
        } else if (error) {
            this.error = 'Erreur lors du chargement des produits';
            this.products = undefined;
        }
    }

    handleDetails(event) {
        const productId = event.target.dataset.id;
        console.log('Product selected:', productId);
        // Ajoute ici la navigation vers la page du produit si nécessaire
    }
}
