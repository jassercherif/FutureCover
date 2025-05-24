import { LightningElement, track, wire } from 'lwc';
import getAllProducts from '@salesforce/apex/ProductController.getAllProducts';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProductList extends NavigationMixin(LightningElement) {
    @track products = [];
    @track error;
    @track isModalOpen = false;
    @track selectedProduct = {};
    @track allProducts = []; // Tous les produits récupérés
    @track selectedFamily = '';
    @track selectedBeneficiary = '';
    @track selectedRenewable = '';
    @track searchKeyword = '';
    @track sortBy = '';

    // Options des filtres
    insuranceTypeOptions = [
        { label: 'All', value: '' },
        { label: 'Travel Insurance', value: 'Travel Insurance' },
        { label: 'Health Insurance', value: 'Health Insurance' },
        { label: 'Life Insurance', value: 'Life Insurance' },
        { label: 'Auto Insurance', value: 'Auto Insurance' }
    ];

    beneficiaryOptions = [
        { label: 'All', value: '' },
        { label: 'Insured Only', value: 'Insured Only' },
        { label: 'Insured and Family', value: 'Insured and Family' },
        { label: 'Insured and Spouse', value: 'Insured and Spouse' }
    ];

    renewableOptions = [
        { label: 'All', value: '' },
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
    ];

    sortOptions = [
        { label: 'None', value: '' },
        { label: 'Price (Low to High)', value: 'priceAsc' },
        { label: 'Price (High to Low)', value: 'priceDesc' },
        { label: 'Coverage Duration', value: 'duration' }
    ];

    // Récupération des produits via Apex
    @wire(getAllProducts)
    wiredProducts({ error, data }) {
        if (data) {
            this.allProducts = data.map(product => ({
                ...product,
                Image__c: product.Image__c || 'https://via.placeholder.com/150'
            }));
            this.applyFilters();
        } else if (error) {
            this.error = 'Erreur lors du chargement des produits';
            console.error('Erreur Apex:', error);
        }
    }

    // Application des filtres
    applyFilters() {
        let filtered = [...this.allProducts];

        // Filtre par type d'assurance
        if (this.selectedFamily) {
            filtered = filtered.filter(p => p.Family === this.selectedFamily);
        }

        // Filtre par bénéficiaires
        if (this.selectedBeneficiary) {
            filtered = filtered.filter(p => p.Beneficiaries__c === this.selectedBeneficiary);
        }

        // Filtre par renouvelable
        if (this.selectedRenewable) {
            filtered = filtered.filter(p => String(p.Renewable__c) === this.selectedRenewable);
        }

        // Filtre par recherche
        if (this.searchKeyword) {
            const keyword = this.searchKeyword.toLowerCase();
            filtered = filtered.filter(p =>
                (p.Name && p.Name.toLowerCase().includes(keyword)) ||
                (p.Description && p.Description.toLowerCase().includes(keyword))
            );
        }

        // Tri
        if (this.sortBy) {
            if (this.sortBy === 'priceAsc') {
                filtered.sort((a, b) => (a.Price__c || 0) - (b.Price__c || 0));
            } else if (this.sortBy === 'priceDesc') {
                filtered.sort((a, b) => (b.Price__c || 0) - (a.Price__c || 0));
            } else if (this.sortBy === 'duration') {
                filtered.sort((a, b) => {
                    const durA = parseInt(a.Coverage_Duration__c, 10) || 0;
                    const durB = parseInt(b.Coverage_Duration__c, 10) || 0;
                    return durA - durB;
                });
            }
        }

        this.products = filtered;
    }

    // Gestion des changements de filtres
    handleFilterChange(event) {
        const { name, value } = event.target;
        if (name === 'insuranceType') this.selectedFamily = value;
        if (name === 'beneficiaries') this.selectedBeneficiary = value;
        if (name === 'renewable') this.selectedRenewable = value;
        if (name === 'sortBy') this.sortBy = value;

        this.applyFilters();
    }

    // Gestion de la recherche
    handleSearchChange(event) {
        this.searchKeyword = event.target.value;
        this.applyFilters();
    }

    // Gestion du tri (déjà géré dans handleFilterChange, mais conservé pour clarté)
    handleSortChange(event) {
        this.sortBy = event.target.value;
        this.applyFilters();
    }

    // Gestion de la modale
    handleOpenModal(event) {
        const productId = event.target.dataset.id;
        this.selectedProduct = this.products.find(product => product.Id === productId) || {};
        this.isModalOpen = true;
    }

    handleCloseModal() {
        this.isModalOpen = false;
        this.selectedProduct = {};
    }

    // Gestion de la souscription
    async handleSubscribe() {
        try {
            if (!this.selectedProduct?.Id) {
                throw new Error('Aucun produit sélectionné');
            }

            sessionStorage.setItem('productId', this.selectedProduct.Id);
            sessionStorage.setItem('productName', this.selectedProduct.Name);
            sessionStorage.setItem('productFamily', this.selectedProduct.Family);

            await this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/get-insured'
                }
            });
        } catch (error) {
            console.error('Erreur dans handleSubscribe:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Erreur',
                    message: error.message,
                    variant: 'error'
                })
            );
        }
    }
}