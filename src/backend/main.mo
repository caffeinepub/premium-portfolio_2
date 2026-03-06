import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type Project = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    category : Text;
    link : Text;
    featured : Bool;
    order : Nat;
  };

  module Project {
    public func compareByOrder(p1 : Project, p2 : Project) : Order.Order {
      Nat.compare(p1.order, p2.order);
    };
  };

  type Review = {
    id : Nat;
    author : Text;
    role : Text;
    text : Text;
    rating : Nat;
    avatarUrl : Text;
  };

  module Review {
    public func compareById(r1 : Review, r2 : Review) : Order.Order {
      Nat.compare(r1.id, r2.id);
    };
  };

  type ContactInfo = {
    name : Text;
    title : Text;
    bio : Text;
    email : Text;
    github : Text;
    linkedin : Text;
    twitter : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    bio : Text;
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let projects = Map.empty<Nat, Project>();
  let reviews = Map.empty<Nat, Review>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var contactInfo : ?ContactInfo = null;
  var lastProjectId = 0;
  var lastReviewId = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Project CRUD
  public shared ({ caller }) func addProject(title : Text, description : Text, imageUrl : Text, category : Text, link : Text, featured : Bool, order : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add projects");
    };

    lastProjectId += 1;
    let project : Project = {
      id = lastProjectId;
      title;
      description;
      imageUrl;
      category;
      link;
      featured;
      order;
    };

    projects.add(lastProjectId, project);
    lastProjectId;
  };

  public shared ({ caller }) func updateProject(id : Nat, title : Text, description : Text, imageUrl : Text, category : Text, link : Text, featured : Bool, order : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update projects");
    };

    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?_) {
        let project : Project = {
          id;
          title;
          description;
          imageUrl;
          category;
          link;
          featured;
          order;
        };
        projects.add(id, project);
      };
    };
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete projects");
    };

    if (not (projects.containsKey(id))) {
      Runtime.trap("Project not found");
    };
    projects.remove(id);
  };

  public query func getAllProjects() : async [Project] {
    projects.values().toArray().sort(Project.compareByOrder);
  };

  public query func getProjectById(id : Nat) : async ?Project {
    projects.get(id);
  };

  public query func getProjectsByCategory(category : Text) : async [Project] {
    let filtered = projects.values().toArray().filter(
      func(p) {
        Text.equal(p.category, category);
      }
    );
    filtered.sort(Project.compareByOrder);
  };

  public query func getFeaturedProjects() : async [Project] {
    let featured = projects.values().toArray().filter(
      func(p) { p.featured }
    );
    featured.sort(Project.compareByOrder);
  };

  // Review CRUD
  public shared ({ caller }) func addReview(author : Text, role : Text, text : Text, rating : Nat, avatarUrl : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    lastReviewId += 1;
    let review : Review = {
      id = lastReviewId;
      author;
      role;
      text;
      rating;
      avatarUrl;
    };

    reviews.add(lastReviewId, review);
    lastReviewId;
  };

  public shared ({ caller }) func updateReview(id : Nat, author : Text, role : Text, text : Text, rating : Nat, avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (reviews.get(id)) {
      case (null) { Runtime.trap("Review not found") };
      case (?_) {
        let review : Review = {
          id;
          author;
          role;
          text;
          rating;
          avatarUrl;
        };
        reviews.add(id, review);
      };
    };
  };

  public shared ({ caller }) func deleteReview(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete reviews");
    };

    if (not (reviews.containsKey(id))) {
      Runtime.trap("Review not found");
    };
    reviews.remove(id);
  };

  public query func getAllReviews() : async [Review] {
    reviews.values().toArray().sort(Review.compareById);
  };

  // Contact Info
  public query func getContactInfo() : async ?ContactInfo {
    contactInfo;
  };

  public shared ({ caller }) func setContactInfo(name : Text, title : Text, bio : Text, email : Text, github : Text, linkedin : Text, twitter : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set contact info");
    };

    let info : ContactInfo = {
      name;
      title;
      bio;
      email;
      github;
      linkedin;
      twitter;
    };

    contactInfo := ?info;
  };

  // Admin Authentication
  // Note: This function verifies a password but does NOT grant admin access.
  // Admin access is controlled via the AccessControl module using Principal-based roles.
  // This function can be used by frontends to validate admin credentials before
  // attempting to call admin-protected functions.
  public query func verifyAdminPassword(password : Text) : async Bool {
    Text.equal(password, "portfolio2024");
  };
};
