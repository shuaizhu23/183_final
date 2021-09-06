/// server javascript, doesn't need dashboard reload
// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    app.data = {
      likes_mode: false,
      add_post_content: "",
      // contacts stored in r0ws
      rows: [],
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

    app.set_task = function(r_idx, t_bool) {
      console.log(!t_bool);
      let task = app.vue.rows[r_idx];
      Vue.set(task, 'task_done', !t_bool);
      axios.post(set_task_url, {id: task.id, task_done: !t_bool});
    };

    app.methods = {
      set_task: app.set_task
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        axios.get(load_tasks_url).then(function (response) {
            // console.log(response)
            app.vue.rows = app.enumerate(response.data.rows);
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
