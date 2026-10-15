import { Label } from "@/components/ui/label.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select.jsx";
import {Button} from "@/components/ui/button.jsx";

// "nafis" varianti faqat client sahifalari uchun; admin standart ko'rinishda qoladi
const nafisStyles = {
  label: "text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe",
  field: "h-12 rounded-2xl border-sand bg-white px-4 text-sm text-espresso shadow-none transition-all duration-300 placeholder:text-taupe/70 focus-visible:border-petal focus-visible:ring-4 focus-visible:ring-blush",
  textarea: "min-h-24 rounded-2xl border-sand bg-white px-4 py-3 text-sm text-espresso shadow-none transition-all duration-300 placeholder:text-taupe/70 focus-visible:border-petal focus-visible:ring-4 focus-visible:ring-blush",
  button: "group mt-5 h-12 rounded-full bg-espresso text-sm font-semibold tracking-wide text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha hover:shadow-lg hover:shadow-mocha/25 disabled:translate-y-0 disabled:bg-taupe/50",
};

function CommonForm({formControls,formData,setFormData,onSubmit,buttonText, isBtnDisabled, variant}){
  const styles = variant === "nafis" ? nafisStyles : {};

  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name] || "";

    switch (getControlItem.componentType) {
      case 'input':
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            className={styles.field}
            value={value}
            onChange={event => setFormData({
              ...formData,
              [getControlItem.name]: event.target.value,
            })
            }
          />
        );
        break;
      case 'select':
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [getControlItem.name]: value,
              })
            }
            value={value}
          >
            <SelectTrigger className={`w-full ${styles.field || ""}`}>
              <SelectValue placeholder={getControlItem.label}/>
            </SelectTrigger>
            <SelectContent>
              {
                getControlItem.options &&
                getControlItem.options.length > 0 ?
                  getControlItem.options.map(optionItem => (<SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                  : null}
            </SelectContent>
          </Select>
        );
        break;
      case 'textarea':
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.id}
            className={styles.textarea}
            value={value}
            onChange={event => setFormData({
              ...formData,
              [getControlItem.name]: event.target.value,
            })
            }
          />
        );
        break;
      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            className={styles.field}
            value={formData[getControlItem.name] || ""}
            onChange={event =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;
    }
    return element;
  }
  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {
          formControls.map(controlItem => <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label htmlFor={controlItem.name} className={`mb-1 ${styles.label || ""}`}>{controlItem.label}</Label>
            {
              renderInputsByComponentType(controlItem)
            }
          </div>)
        }
      </div>
      <Button disabled={isBtnDisabled} type="submit" className={`mt-2 w-full ${styles.button || ""}`}>{buttonText || 'Submit'}
      </Button>
    </form>
  );
}
export default CommonForm;