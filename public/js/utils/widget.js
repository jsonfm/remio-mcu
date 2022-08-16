/**
 * Adds a MIME header to a base64 png image.
 * @param {string} b64 - png image base64 encoded.
 * @returns {string}
 */
 function addMIMEjpeg(b64){
    if(!b64.includes('data:')){
        return `data:image/jpeg;base64,${b64}`;
    }else{
        return b64;
    }
}


/** Custom Image class */
export class CustomImage {
    /**
     * Creates a custom image object.
     * @param {string} imageId - html image element id.
     */
    constructor(imageId){
        this.image = document.getElementById(imageId);
    }

    /**
     * Clears the image content.
     */
    clear(){
        if(this.image){
            this.image.src = '';
        }
    }

    /**
     * Updates the html image source.
     * @param {string} src - image source.
     */
    setSource(src){
        if(this.image){
            this.image.src = src;
        }
    }
    
    /**
     * set a base64 image source.
     * @param {string} b64 - image source on base64 format.
     */
    setBase64Source(b64){
        if(!b64){ return };
        b64 = addMIMEjpeg(b64);
        this.setSource(b64);
    }
}

class Base{
    /**
     * A base clase for objects
     * @param {string} elementId 
     */
    constructor(elementId){
        this.element = document.getElementById(elementId);
    }

    /**
     * A cool API for use addEventListener
     * @param {string} event - a name
     * @param {function} callback - a function
     */
    on(event, callback){
        if(this.element){
            this.element.addEventListener(event, callback);
        }
    }

    /**
     * Updates the enabled value
     * @param {boolean} enabled
    */
    setEnabled(enabled=true){
        if(this.element){
            this.element.disabled = !enabled;
        }
    }

    /** Returns the element value property */
    value(){
        if(this.element){
            return this.element?.value;
        }
        return null;
    }

}

/** A custom buttom */
export class CustomButton extends Base {
    constructor(elementId){
        super(elementId);
    }
}

/** A Binary (Toggle) button */
export class ToggleButton extends Base {
    /**
     * 
     * @param {string} elementId - the id of the element
     * @param {string} onStyle - a css class name
     * @param {string} offStyle - a css class name
     */
    constructor(elementId, onStyle, offStyle) {
        super(elementId);
        this.checked = false;
        this.onStyle = onStyle;
        this.offStyle = offStyle;
        this.on("click", this.toggle.bind(this));
        this.updateStyle();
    }

    /**
     * Updates checked value of the button
     * @param {boolean} checked - checked value
     */
    setChecked(checked=true){
        this.checked = checked;
        this.updateStyle();
    }

    /** Returns checked statuss */
    isChecked(){
        return this.checked;
    }

    /** Updates class styles */
    updateStyle(){
        if(this.element){
           if(this.isChecked()){
               this.element.className = this.onStyle;
           }else{
               this.element.className = this.offStyle;
           }
        }
    }

    /** Toggles the check status */
    toggle(){
        this.checked = !this.checked;
        this.updateStyle();
    }
}

export class CustomSelect extends Base {
    constructor(elementId){
        super(elementId);
        this.items = [];
    }

    clear(){
        if(this.element){
            this.element.innerHTML = '';
        }
    }

    setItems(items){
        if(!items) return null;
        if(this.element){
            for(var i in items){
                this.element.innerHTML+=`<option>${items[i]}</option>`
            }
        }
    }
}


class EventEmitter{
    constructor(){
        this.callbacks = {}
    }

    on(event, cb){
        if(!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(cb)
    }

    emit(event, data){
        let cbs = this.callbacks[event]
        if(cbs){
            cbs.forEach(cb => cb(data))
        }
    }
}
