import { Action, ActionPanel, Form } from '@raycast/api';
import { useForm } from '@raycast/utils';
import tus from 'tus-js-client';
import { createReadStream, statSync } from 'fs';

export default function UploadvideosCommand() {
  const { handleSubmit, itemProps } = useForm({
    onSubmit(values) {
      // https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/#nodejs-example
      console.log(values);

      values.files.forEach((path) => {
        var file = createReadStream(path);
        var size = statSync(path).size;
        var mediaId = '';

        var options = {
          endpoint:
            'https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream',
          headers: {
            Authorization: 'Bearer <API_TOKEN>',
          },
          chunkSize: 50 * 1024 * 1024, // Required a minimum chunk size of 5MB, here we use 50MB.
          retryDelays: [0, 3000, 5000, 10000, 20000], // Indicates to tus-js-client the delays after which it will retry if the upload fails
          metadata: {
            filename: 'test.mp4',
            filetype: 'video/mp4',
            defaulttimestamppct: 0.5,
            watermark: '<WATERMARK_UID>',
          },
          uploadSize: size,
          onError: function (error: Error) {
            throw error;
          },
          onProgress: function (bytesUploaded: number, bytesTotal: number) {
            var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
            console.log(bytesUploaded, bytesTotal, percentage + '%');
          },
          onSuccess: function () {
            console.log('Upload finished');
          },
          onAfterResponse: function (req: any, res: any) {
            return new Promise<void>((resolve) => {
              var mediaIdHeader = res.getHeader('stream-media-id');
              if (mediaIdHeader) {
                mediaId = mediaIdHeader;
              }
              resolve();
            });
          },
        };

        var upload = new tus.Upload(file, options as any);
        upload.start();
      });
    },
    initialValues: {
      files: [] as string[],
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker {...itemProps.files}></Form.FilePicker>
    </Form>
  );
}
