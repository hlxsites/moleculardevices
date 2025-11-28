export default class Item {
  constructor(identifier, title, path, thumbnail, familyID, specifications) {
    this.identifier = identifier;
    this.title = title;
    this.path = path;
    this.thumbnail = thumbnail;
    this.familyID = familyID;
    this.specifications = specifications;
  }

  getTitle() {
    return this.title;
  }

  getPath() {
    return this.path;
  }

  getIdentifier() {
    return this.identifier;
  }

  getThumbnail() {
    return this.thumbnail;
  }

  getFamilyID() {
    return this.familyID;
  }

  getSpecs() {
    return this.specifications;
  }
}
