/// server javascript, doesn't need dashboard reload
// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    app.data = {
      add_mode: false,
      likes_mode: false,
      add_post_content: "",
      // contacts stored in r0ws
      rows: [],
      rows_c: []
    };

    app.enumerate = (a) => {
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.decorate = (a) => {
        /// js object
        a.map((e) => {e._state = {post_content: "clean", full_name: "clean"} ;});
        a.map((e) => {
          if (user_email != e.user_email) {
            e.owned = false;
          } else {
            e.owned = true;
          }
        });
        return a;
    }

    app.toggle_like = function (r_idx, val) {
        console.log('hi', r_idx)
        let r = app.vue.rows_c[r_idx];
        r.liked = val;
        // console.log(display_full_name)
        axios.post(toggle_like_url,
        {
            id: r.id,
            value: r.liked,
        });
    };

    app.add_post = function () {
      axios.post(add_post_url,
      {
          post_content: app.vue.add_post_content,
          full_name: display_full_name,
          liked: '',
          // ,a_user_email: app.vue.add_user_email
      }).then(function (response) {
        /// db id received after inserted
        /// response.data.id
        // console.log(response)
        app.vue.rows_c.unshift({
            id: response.data.id,
            post_content: app.vue.add_post_content,
            full_name: display_full_name,
            liked: '',
            /// pass st@te, in case another edit pending
            _state: {post_content: "clean", full_name: "clean"},
        });
        /// defined underscore index 25:53
        app.decorate(app.enumerate(app.vue.rows_c));
        /// blank out form after submit, intersting that have to simulate html response
        app.reset_form();
        app.set_add_status(false);
      });
    };

    app.reset_form = function () {
        app.vue.add_post_content = "";
    };

    app.delete_contact = function(row_idx) {
      /// watch array index
      /// get, dictionary encoded in url param 156
      let id = app.vue.rows_c[row_idx].id;
      /// not symmetrical, follow axios definition
      axios.get(delete_contact_url, {params: {id: id}}).then(function (response) {
        /// race condition with slow network?
        /// confirm intended row is deleted
        for (let i = 0; i < app.vue.rows_c.length; i++) {
            if (app.vue.rows_c[i].id === id) {
                app.vue.rows_c.splice(i, 1);
                app.enumerate(app.vue.rows_c);
                break;
            }
        }
      });
    };

    // set add mode to new status
    app.set_add_status = function (new_status) {
        app.vue.add_mode = new_status;
    };

    app.show_likers = function (bool) {
        app.vue.likes_mode = bool;
    };

    app.methods = {
      add_post: app.add_post,
      set_add_status: app.set_add_status,
      delete_contact: app.delete_contact,
      show_likers: app.show_likers,
      toggle_like: app.toggle_like
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        axios.get(load_contacts_url).then(function (response) {
            app.vue.rows_c = app.decorate(app.enumerate(response.data.rows.reverse()));
        });

        axios.get(load_tasks_url).then(function (response) {
            // console.log(response)
            app.vue.rows = response.data.rows;
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
