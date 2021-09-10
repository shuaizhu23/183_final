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

      bp_xp: 500,
      bp_progress: 50,
    };

    // file selected for upload.
    app.file = null;

    app.enumerate = (a) => {
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.complete = (a) => {
        a.map((e) => {
          e.rating = 0;
          e.stars_display = 0;
        });
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
        app.vue.bp_xp = (app.vue.bp_progress * 10) - task.task_xp;
        app.vue.bp_progress = ((app.vue.bp_progress * 10) - task.task_xp) / 10;

        app.vue.done_tasks--;
      } else {
        app.vue.bp_xp = (app.vue.bp_progress * 10) + task.task_xp;
        app.vue.bp_progress = ((app.vue.bp_progress * 10) + task.task_xp) / 10;

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
                    row.task_img = reader.result;
                });
          });
          reader.readAsDataURL(file);
      }
    };

    app.set_difficulty = (r_idx, num_stars) => {
      let task = app.vue.rows[r_idx];
      task.rating = num_stars;
      // Sets the stars on the server.
      axios.post(set_difficulty_url, {id: task.id, task_difficulty: num_stars});
    };

    // Just handles show and hide stars
      app.stars_out = (r_idx) => {
        let task = app.vue.rows[r_idx];
        task.stars_display = task.rating;
      };

      app.stars_over = (r_idx, num_stars) => {
        let task = app.vue.rows[r_idx];
        task.stars_display = num_stars;
      };

    app.delete_task = (row_idx) => {
      let id = app.vue.rows[row_idx].id;
      axios.get(delete_task_url, {params: {id: id}}).then(function (response) {
          for (let i = 0; i < app.vue.rows.length; i++) {
              if (app.vue.rows[i].id === id) {
                  app.vue.rows.splice(i, 1);
                  app.enumerate(app.vue.rows);
                  break;
              }
          }
          app.vue.rows.forEach(element => {
            if (element.task_done) {app.vue.done_tasks--;}
          })
          app.vue.total_tasks = app.vue.rows.length;
      });
    };

    app.methods = {
      set_task: app.set_task,
      delete_task: app.delete_task,
      set_difficulty: app.set_difficulty,
      upload_file: app.upload_file,

      stars_out: app.stars_out,
      stars_over: app.stars_over,
    };

    // create the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    app.init = () => {
      console.log(view_task_id);
        axios.get(load_tasks_url, {params: {"id":view_task_id}}).then(function (response) {
            let tasks = app.complete(app.enumerate(response.data.rows));
            tasks.forEach(element => {
              if (element.task_done) {app.vue.done_tasks++;}
            })
            app.vue.rows = tasks;
            app.vue.total_tasks = tasks.length;
        })
        // performs function without modifiying or returning anything
        .then(() => {
            for (let task of app.vue.rows) {
              axios.get(get_difficulty_url, {params: {"id": task.id, "vid":view_task_id}})
                .then((result) => {
                    task.rating = result.data.task_difficulty;
                    task.stars_display = result.data.task_difficulty;
                });
            }
        });
    };

    // Call to the initializer.
    app.init();
};

// takes the (empty) app object, and initializes it,
init(app);
