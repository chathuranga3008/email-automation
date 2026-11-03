import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-section-page',
  standalone: true,
  template: `
    <div class="page-heading">
      <h2>{{ title() }}</h2>
      <p>{{ description() }}</p>
    </div>
  `,
  styles: `
    .page-heading {
      background: #ffffff;
      border: 1px solid #e7eaf0;
      border-radius: 10px;
      padding: 26px;
    }

    h2 {
      margin: 0 0 10px;
      color: #17243a;
      font-size: 21px;
    }

    p {
      margin: 0;
      color: #8290a3;
      font-size: 13px;
    }
  `,
})
export class SectionPage {
  private route = inject(ActivatedRoute);

  title = toSignal(
    this.route.data.pipe(map(data => data['title'] as string)),
    { initialValue: 'Dashboard' }
  );

  description = toSignal(
    this.route.data.pipe(map(data => data['description'] as string)),
    { initialValue: 'Welcome to the Email Automation System.' }
  );
}
