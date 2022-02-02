import { v4 } from 'uuid'
import { DI } from '../DI.js'
import { Injectable } from '../decorators/Injectable.js'
import { LateInjectable } from '../decorators/LateInjectable.js'
import { Lifecycle } from '../Lifecycle.js'
import { Scope } from '../decorators/Scope.js'

describe('DI - Child', function () {
  describe('when creating a child container', function () {
    @Injectable()
    @Scope(Lifecycle.CONTAINER)
    class ContainerSvc {
      readonly id: string = v4()
    }

    @Injectable()
    class Svc {
      readonly id: string = v4()
    }

    it('should resolve a instance per container when lifecycle is CONTAINER', function () {
      const parent = DI.setup()
      const svc1 = parent.get(ContainerSvc)
      const svcCont1 = parent.get(Svc)
      const child = parent.newChild()
      const svc2 = child.get(ContainerSvc)
      const svcCont2 = child.get(Svc)

      const svc3 = parent.get(ContainerSvc)
      const svc4 = child.get(ContainerSvc)
      const svcCont3 = parent.get(Svc)

      expect(parent.has(ContainerSvc)).toBeTruthy()
      expect(parent.has(Svc)).toBeTruthy()
      expect(child.has(ContainerSvc)).toBeTruthy()
      expect(child.has(Svc)).toBeFalsy()
      expect(child.has(Svc, true)).toBeTruthy()
      expect(svc1).not.toEqual(svc2)
      expect(svc1).toEqual(svc3)
      expect(svc2).toEqual(svc4)
      expect(svcCont1).toEqual(svcCont2)
      expect(svcCont2).toEqual(svcCont3)
    })
  })

  describe('when child contains root', function () {
    describe('and parent contains injection dependency', function () {
      @LateInjectable()
      class Dep {
        readonly id: string = v4()
      }

      @LateInjectable()
      class Svc {
        constructor(readonly dep: Dep) {}
      }

      it('should resolve requested type', function () {
        const parent = DI.setup()
        const child = parent.newChild()

        parent.bind(Dep).toSelf()
        child.bind(Svc).toSelf()

        const parentDep = parent.get(Dep)
        const childDep = child.get(Dep)
        const svc = child.get(Svc)

        expect(parent.has(Dep)).toBeTruthy()
        expect(parent.has(Svc)).toBeFalsy()
        expect(child.has(Dep)).toBeFalsy()
        expect(child.has(Svc)).toBeTruthy()
        expect(child.has(Dep, true)).toBeTruthy()
        expect(child.has(Svc, true)).toBeTruthy()
        expect(parentDep).toBeInstanceOf(Dep)
        expect(svc).toBeInstanceOf(Svc)
        expect(svc.dep).toBeInstanceOf(Dep)
        expect(parentDep).toEqual(childDep)
      })
    })
  })
})
