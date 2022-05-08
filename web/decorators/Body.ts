import { Web } from '../Web.js'
import { BodyPicker } from '../BodyPicker.js'

export function Body(): ParameterDecorator {
  return Web.pickerFor(new BodyPicker())
}
