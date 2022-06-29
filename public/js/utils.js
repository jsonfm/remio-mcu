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
class CustomImage {
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
    constructor(elementId){
        this.element = document.getElementById(elementId);
    }

    on(event, callback){
        if(this.element){
            this.element.addEventListener(event, callback);
        }
    }

    setEnabled(enabled){
        if(this.element){
            this.element.disabled = !enabled;
        }
    }

    value(){
        if(this.element){
            return this.element.value;
        }
        return null;
    }

}

class CustomButton extends Base {
    constructor(elementId){
        super(elementId);
    }
}

class ToogleButton extends Base {
    constructor(elementId, onStyle, offStyle) {
        super(elementId);
        this.checked = false;
        this.onStyle = onStyle;
        this.offStyle = offStyle;
        this.on("click", this.toogle.bind(this));
        this.updateStyle();
    }

    setChecked(checked){
        this.checked = checked;
        this.updateStyle();
    }

    isChecked(){
        return this.checked;
    }

    updateStyle(){
        if(this.element){
           if(this.isChecked()){
               this.element.className = this.onStyle;
           }else{
               this.element.className = this.offStyle;
           }
        }
    }

    toogle(){
        this.checked = !this.checked;
        this.updateStyle();
    }
}

class CustomSelect extends Base {
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

class Variables {
    /**
     * Creates an inteligent variables manager (JSON).
     * @param {object} variables - a json with variables names and values.
     */
    constructor(variables={}){
        this.variables = variables;
        this.backup = {...variables};
        this.updatedStatus = false;
    }

    toString(){
        return this.variables;
    }

    /**
     * Restores the variables values using the backup.
     */
    restore(){
        this.variables = {...this.backup};
    }

    /** 
     * Returns the variables values.
    */
    values(){
        return this.variables;
    }

    /**
     * Updates a specific variable value
     * @param {string} key - the variable name
     * @param {*} value - a value for the current variable
     * @param {boolean} backup - save the previous variables values?
     */
    set = (key, value, backup = true) => {
        if(backup){
            this.backup = {...this.variables};
        }
        this.variables[key] = value;
    }
    
    /**
     * Returns a value of the variables JSON given a key
     * @param {string} key - the current variable name
     */
    get = (key) => {
        return this.variable[key];
    }

    /**
     * Updates the updated status.
     * @param {boolean} value.
     */
    setUpdated = (value) => {
        this.updatedStatus = value;
    }

    /** 
     * Updates variables values.
     * @param {string} data - a json string with variables.
    */
    update = (data) => {
        let variables = data;
        if (typeof variables === 'string'){
            variables = JSON.parse(variables);
        }
        this.variables = {...variables};
        this.backup = {...variables};
        this.setUpdated(true);
    }

    /** 
     * Returns the updated status value
     * @returns {boolean} - updated status
    */
    updated = () =>{
        return this.updatedStatus;
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


class ReusableTimer {
    constructor(cb, delay){
        this.cb = cb;
        this.delay = delay;
        this.timer = null;
    }

    start(){
        this.stop();
        this.timer = setTimeout(this.cb, this.delay);
    }

    stop(){
        if(this.timer){
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}
