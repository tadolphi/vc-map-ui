import { IndexedCollection, VcsObject, VectorStyleItem } from '@vcmap/core';
import OlFeature from 'ol/Feature.js';
import { Point } from 'ol/geom.js';
import Category from '../../src/Category.js';
import VcsApp from '../../src/vcsApp.js';
import { contextIdSymbol } from '../../src/vcsAppContextHelpers.js';

describe('Category', () => {
  let app;

  before(() => {
    app = new VcsApp();
  });

  after(() => {
    app.destroy();
  });

  describe('setting the collection on a category', () => {
    describe('with a valid empty new collection', () => {
      let category;
      let collection;
      let oldCollection;
      let itemAddedSpy;
      let itemRemovedSpy;
      let itemMovedSpy;
      let destroyedSpy;

      before(() => {
        category = new Category({});
        category.setApp(app);
        oldCollection = category.collection;
        destroyedSpy = sinon.spy(oldCollection, 'destroy');
        collection = new IndexedCollection();
        itemAddedSpy = sinon.spy(category, '_itemAdded');
        itemRemovedSpy = sinon.spy(category, '_itemRemoved');
        itemMovedSpy = sinon.spy(category, '_itemMoved');
        category.setCollection(collection);
      });

      after(() => {
        itemAddedSpy.restore();
        itemRemovedSpy.restore();
        itemMovedSpy.restore();
        destroyedSpy.restore();
        category.destroy();
      });

      it('should destroy the old collection', () => {
        expect(destroyedSpy).to.have.been.called;
      });

      it('should set the new collection', () => {
        expect(category.collection).to.equal(collection);
      });

      describe('collection listeners', () => {
        it('should add add listeners to the new collection', () => {
          const item = { name: 'foo' };
          collection.add(item);
          expect(itemAddedSpy).to.have.been.calledWithExactly(item);
          collection.add({ name: 'bar' });
          itemAddedSpy.resetHistory();
          collection.raise(item, 1);
          expect(itemMovedSpy).to.have.been.calledWithExactly(item);
          itemMovedSpy.resetHistory();
          collection.remove(item);
          expect(itemRemovedSpy).to.have.been.calledWithExactly(item);
          itemRemovedSpy.resetHistory();
        });

        it('should no longer listen to the old collections events', () => {
          const item = { name: 'foo' };
          oldCollection.add(item);
          oldCollection.add({ name: 'bar' });
          oldCollection.raise(item, 1);
          oldCollection.remove(item);

          expect(itemAddedSpy).to.not.have.been.called;
          expect(itemMovedSpy).to.not.have.been.called;
          expect(itemRemovedSpy).to.not.have.been.called;
        });
      });
    });

    describe('while the current collection is already filled', () => {
      it('should destroy any items inside', () => {
        const category = new Category({});
        category.setApp(app);
        const item = new VcsObject({});
        category.collection.add(item);
        category.setCollection(new IndexedCollection());
        expect(item.isDestroyed).to.be.true;
        category.destroy();
      });

      it('should remove all feature from the category layer', () => {
        const category = new Category({
          featureProperty: 'feature',
        });
        category.setApp(app);
        category.collection.add({ name: 'foo', feature: new OlFeature() });
        category.setCollection(new IndexedCollection());
        expect(category.layer.getFeatures()).to.be.empty;
        category.destroy();
      });
    });

    describe('if the new collection is already filled', () => {
      it('should call added for each item newly added', () => {
        const item = { name: 'foo' };
        const category = new Category({});
        category.setApp(app);
        const itemAddedSpy = sinon.spy(category, '_itemAdded');
        category.setCollection(IndexedCollection.from([item]));
        expect(itemAddedSpy).to.have.been.calledWithExactly(item);
        category.destroy();
      });
    });

    it('should fail, if the keyProperty of the collection does not match the categories key property', () => {
      const category = new Category({ keyProperty: 'foo' });
      expect(() => { category.setCollection(new IndexedCollection()); }).to.throw;
    });
  });

  describe('adding items to the collection', () => {
    describe('if there is no feature property', () => {
      /** @type {Category} */
      let category;
      let app1;

      before(async () => {
        app1 = new VcsApp();
        category = await app1.categories.requestCategory({ name: 'foo' });
      });

      after(() => {
        app1.destroy();
      });

      it('should add the dynamic context Id of the app to the feature, if it does not have a context ID set', () => {
        const item = { name: 'foo' };
        category.collection.add(item);
        expect(item).to.have.property(contextIdSymbol, app1.dynamicContextId);
      });

      it('should not overwrite the context id of an item which already has a context id', () => {
        const item = { name: 'bar' };
        item[contextIdSymbol] = 'bar';
        category.collection.add(item);
        expect(item).to.have.property(contextIdSymbol, 'bar');
      });
    });

    describe('if there is a featureProperty', () => {
      /** @type {Category} */
      let category;
      let app1;

      before(async () => {
        app1 = new VcsApp();
        category = await app1.categories.requestCategory({ name: 'foo', featureProperty: 'feature' });
      });

      after(() => {
        app1.destroy();
      });

      it('should add an ol.Feature to the layer', (done) => {
        const item = { name: 'foo', feature: new OlFeature() };
        category.collection.add(item);

        setTimeout(() => {
          expect(category.layer.getFeatureById(item.name)).to.equal(item.feature);
          done();
        }, 20);
      });

      it('should assure, the id and the item key property match', () => {
        const feature = new OlFeature();
        feature.setId('foo');
        const item = { name: 'bar', feature };
        category.collection.add(item);
        expect(feature.getId()).to.equal(item.name);
      });

      it('should create an ol.Feature from a geojson feature object', (done) => {
        const item = {
          name: 'baz',
          feature: {
            type: 'Feature',
            properties: { foo: true },
            geometry: { type: 'Point', coordinates: [0, 0, 1] },
          },
        };
        category.collection.add(item);
        setTimeout(() => {
          const feature = category.layer.getFeatureById(item.name);
          expect(feature).to.be.an.instanceOf(OlFeature);
          expect(feature.getProperties()).to.have.property('foo', true);
          done();
        }, 20);
      });

      it('should serialize an ol.Feature on replace', (done) => {
        const item = {
          name: 'baz',
          feature: {
            type: 'Feature',
            properties: { foo: true },
            geometry: { type: 'Point', coordinates: [0, 0, 1] },
          },
        };
        category.collection.add(item);
        const otherItem = { name: 'baz' };
        category.collection.override(otherItem);

        const otherFeature = category.layer.getFeatureById(item.name);
        expect(otherFeature).to.be.null;

        category.collection.remove(otherItem);
        setTimeout(() => {
          const feature = category.layer.getFeatureById(item.name);
          expect(feature).to.be.an.instanceOf(OlFeature);
          done();
        }, 20);
      });
    });
  });

  describe('serializing a category for a context', () => {
    describe('of an empty category', () => {
      it('should return null', () => {
        const category = new Category({});
        expect(category.serializeForContext('foo')).to.be.null;
        category.destroy();
      });
    });

    describe('of a category with a filled collection', () => {
      let serialized;
      let fooItem;

      before(() => {
        const category = new Category({
          name: 'bar',
        });
        category.setApp(app);
        fooItem = { name: 'foo', [contextIdSymbol]: 'foo' };
        category.collection.add(fooItem);
        category.collection.add({ name: 'bar' });
        const bazItem = new VcsObject({ name: 'baz' });
        bazItem[contextIdSymbol] = 'foo';
        category.collection.add(bazItem);
        serialized = category.serializeForContext('foo');
        category.destroy();
      });

      it('should serialize the items of said context', () => {
        expect(serialized).to.have.property('items').and.to.have.lengthOf(2);
        expect(serialized.items.map(i => i.name)).to.have.members(['foo', 'baz']);
      });

      it('should copy/serialize the items', () => {
        const serializedFooItem = serialized.items.find(i => i.name === 'foo');
        expect(serializedFooItem).to.have.all.keys('name');
        expect(serializedFooItem).to.not.equal(fooItem);

        const serializedBazItem = serialized.items.find(i => i.name === 'baz');
        expect(serializedBazItem).to.not.be.an.instanceOf(VcsObject);
      });
    });

    describe('of a category with a feature property', () => {
      let serialized;
      let fooItem;

      before((done) => {
        const category = new Category({
          name: 'bar',
          featureProperty: 'feat',
        });
        category.setApp(app);
        fooItem = { name: 'foo', [contextIdSymbol]: 'foo', feat: new OlFeature({ geometry: new Point([1, 1, 0]) }) };
        category.collection.add(fooItem);
        category.collection.add({ name: 'bar' });
        const bazItem = new VcsObject({ name: 'baz' });
        bazItem[contextIdSymbol] = 'foo';
        category.collection.add(bazItem);

        setTimeout(() => {
          serialized = category.serializeForContext('foo');
          category.destroy();
          done();
        }, 20);
      });

      it('should serialize the items of said context', () => {
        expect(serialized).to.have.property('items').and.to.have.lengthOf(2);
        expect(serialized.items.map(i => i.name)).to.have.members(['foo', 'baz']);
      });

      it('should serialize a features property', () => {
        expect(serialized.items[0]).to.have.property('feat')
          .and.to.have.property('type', 'Feature');
      });
    });
  });

  describe('merging of category options', () => {
    describe('of valid options', () => {
      describe('of a default category', () => {
        let category;
        let options;

        before(() => {
          options = {
            title: 'foo',
            layerOptions: {
              zIndex: 5,
            },
          };
          category = new Category({});
          category.mergeOptions(options);
        });

        after(() => {
          category.destroy();
        });

        it('should configure title', () => {
          expect(category).to.have.property('title', options.title);
        });

        it('should ignore layerOptions', () => {
          expect(category.layer).to.be.null;
        });
      });

      describe('of a typed category with feature & key properties', () => {
        let category;
        let options;

        before(() => {
          options = {
            title: 'foo',
            typed: true,
            featureProperty: 'feature',
            keyProperty: 'key',
            layerOptions: {
              style: new VectorStyleItem({}),
              highlightStyle: new VectorStyleItem({}),
              vectorProperties: {
                extrudedHeight: 80,
              },
              zIndex: 5,
            },
          };
          category = new Category({
            typed: true,
            featureProperty: 'feature',
            keyProperty: 'key',
          });
          category.mergeOptions(options);
        });

        after(() => {
          category.destroy();
        });

        it('should configure title', () => {
          expect(category).to.have.property('title', options.title);
        });

        it('should set layerOptions style', () => {
          expect(category.layer).to.have.property('style', options.layerOptions.style);
        });

        it('should set layerOptions highlightStyle', () => {
          expect(category.layer).to.have.property('highlightStyle', options.layerOptions.highlightStyle);
        });

        it('should set layerOptions zIndex', () => {
          expect(category.layer).to.have.property('zIndex', options.layerOptions.zIndex);
        });

        it('should set layerOptions vectorProperties', () => {
          expect(category.layer).to.have.property('vectorProperties')
            .and.to.have.property('extrudedHeight', options.layerOptions.vectorProperties.extrudedHeight);
        });
      });
    });

    describe('of invalid options', () => {
      describe('of a default category', () => {
        let category;

        before(() => {
          category = new Category({});
        });

        after(() => {
          category.destroy();
        });

        it('should throw on resetting typed', () => {
          expect(() => category.mergeOptions({ typed: true })).to.throw;
        });

        it('should throw on resetting featureProperty', () => {
          expect(() => category.mergeOptions({ featureProperty: 'foo' })).to.throw;
        });

        it('should throw on resetting keyProperty', () => {
          expect(() => category.mergeOptions({ keyProperty: 'foo' })).to.throw;
        });
      });

      describe('of a typed category with feature & key properties', () => {
        let category;
        let options;

        before(() => {
          options = {
            typed: true,
            featureProperty: 'feature',
            keyProperty: 'key',
          };
          category = new Category(options);
        });

        after(() => {
          category.destroy();
        });

        it('should throw on resetting typed', () => {
          expect(() => category.mergeOptions({ ...options, typed: false })).to.throw;
        });

        it('should throw on resetting featureProperty', () => {
          expect(() => category.mergeOptions({ ...options, featureProperty: 'foo' })).to.throw;
        });

        it('should throw on resetting keyProperty', () => {
          expect(() => category.mergeOptions({ ...options, keyProperty: 'foo' })).to.throw;
        });

        it('should throw on omitting typed', () => {
          const missingOptions = { ...options };
          delete missingOptions.typed;
          expect(() => category.mergeOptions(missingOptions)).to.throw;
        });

        it('should throw on omitting featureProperty', () => {
          const missingOptions = { ...options };
          delete missingOptions.featureProperty;
          expect(() => category.mergeOptions(missingOptions)).to.throw;
        });

        it('should throw on omitting keyProperty', () => {
          const missingOptions = { ...options };
          delete missingOptions.keyProperty;
          expect(() => category.mergeOptions(missingOptions)).to.throw;
        });
      });
    });
  });
});
