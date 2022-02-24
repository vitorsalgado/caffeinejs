import 'reflect-metadata'
import './Registrar.js'

import { Scan } from './Scan.js'

@Scan([])
class App {}

console.log('app')
