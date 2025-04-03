import { LightningElement, wire, track } from 'lwc';
import getAllProducts from '@salesforce/apex/ProductController.getAllProducts';

export default class ProductList extends LightningElement {
    @track products;
    @track error;
    @track isModalOpen = false;
    @track selectedProduct = {};

    @wire(getAllProducts)
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data.map(product => ({
                ...product,
                Image__c: product.Image__c || 'https://via.placeholder.com/150' // Image par défaut
            }));
            console.log('Produits chargés :', JSON.stringify(this.products, null, 2)); // Console log formaté
            this.error = undefined;
        } else if (error) {
            this.error = 'Erreur lors du chargement des produits';
            console.error('Erreur de récupération des produits:', error);
            this.products = undefined;
        }
    }
    
    

    handleOpenModal(event) {
        const productId = event.target.dataset.id;
        this.selectedProduct = this.products.find(product => product.Id === productId);
        this.isModalOpen = true;
    }

    handleCloseModal() {
        this.isModalOpen = false;
        this.selectedProduct = {};
    }
}
