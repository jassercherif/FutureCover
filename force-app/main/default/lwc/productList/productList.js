import { LightningElement, wire, track } from 'lwc';
import getAllProducts from '@salesforce/apex/ProductController.getAllProducts';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ProductList extends NavigationMixin(LightningElement) {
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
    async handleSubscribe() {
        try {
            if (!this.selectedProduct) {
                throw new Error('No product selected');
            }
    
            const productId = this.selectedProduct.Id;
            const productName = this.selectedProduct.Name;
            const productFamily = this.selectedProduct.Family;
            
            if (!productId || !productName || !productFamily) {
                throw new Error('Product data is incomplete');
            }
    
            // Store in sessionStorage
            sessionStorage.setItem('productId', productId);
            sessionStorage.setItem('productName', productName);
            sessionStorage.setItem('productFamily', productFamily);
    
            // Verify NavigationMixin is available
            if (!this[NavigationMixin.Navigate]) {
                throw new Error('NavigationMixin not properly initialized');
            }
    
            // Navigate to page
            await this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/get-insured'  // Target page
                }
            });
    
        } catch (error) {
            console.error('Error in handleSubscribe:', error);
            // You can add user-friendly error handling here, for example:
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.message,
                    variant: 'error'
                })
            );
            
            // For debugging purposes, you might want to log additional info:
            console.log('Selected product:', this.selectedProduct);
            console.log('NavigationMixin available:', !!this[NavigationMixin.Navigate]);
        }
    }
    
    

}
