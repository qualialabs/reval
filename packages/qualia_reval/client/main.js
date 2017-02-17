import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {reloadPage} from './blaze.js';

let Reval = new Mongo.Collection('reval');
Meteor.subscribe('reval');

Tracker.autorun(comp => {
  let result = Reval.findOne();
  if (result && result.payload) {
    eval(result.payload);
    reloadPage();
  }
});
