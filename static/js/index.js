/// server javascript, doesn't need dashboard reload
// object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    app.data = {
      done_tasks: 0,
      total_tasks: 0,
      rows: [],
    };

    // file selected for upload.
    app.file = null;

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

    // set task done
    app.set_task = function(r_idx, t_bool) {
      let task = app.vue.rows[r_idx];
      if (t_bool) {
        app.vue.done_tasks--;
      } else {
        app.vue.done_tasks++;
      }
      Vue.set(task, 'task_done', !t_bool);
      axios.post(set_task_url, {id: task.id, task_done: !t_bool});
    };

    app.upload_file = function (event, row_idx) {
      let input = event.target;
      let file = input.files[0];
      let row = app.vue.rows[row_idx];
      if (file) {
          let reader = new FileReader();
          reader.addEventListener("load", function () {
              // Sends the image to the server.
              axios.post(upload_thumbnail_url, {
                    task_id: row.id,
                    thumbnail: reader.result,
                }).then(function () {
                    // Sets the local preview.
                    // local preview not updating
                    row.task_img = reader.result;
                });
          });
          reader.readAsDataURL(file);
      }
    };

    app.methods = {
      set_task: app.set_task,
      upload_file: app.upload_file,
    };

    // create the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
        axios.get(load_tasks_url).then(function (response) {
            tasks = app.enumerate(response.data.rows);
            tasks.forEach(element => {
              if (element.task_done) {app.vue.done_tasks++;}
            })
            app.vue.rows = tasks;
            app.vue.total_tasks = tasks.length;
        });
    };

    // Call to the initializer.
    app.init();
};

// takes the (empty) app object, and initializes it,
init(app);
