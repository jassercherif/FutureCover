import { LightningElement, track } from 'lwc';

export default class FaqQuestions extends LightningElement {
    @track showAnswer1 = false;
    @track showAnswer2 = false;
    @track showAnswer3 = false;
    @track selectedQuestionId = null;

    get questionClass1() {
        return this.selectedQuestionId === '1' ? 'question selected' : 'question';
    }

    get questionClass2() {
        return this.selectedQuestionId === '2' ? 'question selected' : 'question';
    }

    get questionClass3() {
        return this.selectedQuestionId === '3' ? 'question selected' : 'question';
    }

    get questionClass4() {
        return this.selectedQuestionId === '4' ? 'question selected' : 'question';
    }

    get questionClass5() {
        return this.selectedQuestionId === '5' ? 'question selected' : 'question';
    }

    get questionClass6() {
        return this.selectedQuestionId === '6' ? 'question selected' : 'question';
    }

    get questionClass7() {
        return this.selectedQuestionId === '7' ? 'question selected' : 'question';
    }

    get questionClass8() {
        return this.selectedQuestionId === '8' ? 'question selected' : 'question';
    }

    get questionClass9() {
        return this.selectedQuestionId === '9' ? 'question selected' : 'question';
    }

    get questionClass10() {
        return this.selectedQuestionId === '10' ? 'question selected' : 'question';
    }

    get answerClass1() {
        return this.showAnswer1 ? 'answer active' : 'answer';
    }

    get answerClass2() {
        return this.showAnswer2 ? 'answer active' : 'answer';
    }

    get answerClass3() {
        return this.showAnswer3 ? 'answer active' : 'answer';
    }

    get answerClass4() {
        return this.showAnswer4 ? 'answer active' : 'answer';
    }

    get answerClass5() {
        return this.showAnswer5 ? 'answer active' : 'answer';
    }

    get answerClass6() {
        return this.showAnswer6 ? 'answer active' : 'answer';
    }

    get answerClass7() {
        return this.showAnswer7 ? 'answer active' : 'answer';
    }

    get answerClass8() {
        return this.showAnswer8 ? 'answer active' : 'answer';
    }

    get answerClass9() {
        return this.showAnswer9 ? 'answer active' : 'answer';
    }

    get answerClass10() {
        return this.showAnswer10 ? 'answer active' : 'answer';
    }

    toggleAnswer(event) {
        const id = event.currentTarget.dataset.id;
        if (id === '1') {
            this.showAnswer1 = !this.showAnswer1;
            this.selectedQuestionId = this.showAnswer1 ? '1' : null;
        } else if (id === '2') {
            this.showAnswer2 = !this.showAnswer2;
            this.selectedQuestionId = this.showAnswer2 ? '2' : null;
        } else if (id === '3') {
            this.showAnswer3 = !this.showAnswer3;
            this.selectedQuestionId = this.showAnswer3 ? '3' : null;
        } else if (id === '4') {
            this.showAnswer4 = !this.showAnswer4;
            this.selectedQuestionId = this.showAnswer4 ? '4' : null;
        } else if (id === '5') {
            this.showAnswer5 = !this.showAnswer5;
            this.selectedQuestionId = this.showAnswer5 ? '5' : null;
        } else if (id === '6') {
            this.showAnswer6 = !this.showAnswer6;
            this.selectedQuestionId = this.showAnswer6 ? '6' : null;
        } else if (id === '7') {
            this.showAnswer7 = !this.showAnswer7;
            this.selectedQuestionId = this.showAnswer7 ? '7' : null;
        } else if (id === '8') {
            this.showAnswer8 = !this.showAnswer8;
            this.selectedQuestionId = this.showAnswer8 ? '8' : null;
        } else if (id === '9') {
            this.showAnswer9 = !this.showAnswer9;
            this.selectedQuestionId = this.showAnswer9 ? '9' : null;
        } else if (id === '10') {
            this.showAnswer10 = !this.showAnswer10;
            this.selectedQuestionId = this.showAnswer10 ? '10' : null;
        }
    }
}


